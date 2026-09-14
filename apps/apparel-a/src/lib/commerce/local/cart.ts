import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import { CommerceError, type Cart } from "../types";
import { loadCatalog } from "./catalog";
import { hydrateOrder, recalculateOrder } from "./hydrate";
import { generateOrderNumber, generateToken } from "./shared";

async function findOpenOrderByToken(orderToken: string) {
  const [row] = await db
    .select()
    .from(s.orders)
    .where(and(eq(s.orders.token, orderToken), ne(s.orders.state, "complete")))
    .limit(1);
  return row ?? null;
}

export async function requireOpenOrder(orderToken: string) {
  const row = await findOpenOrderByToken(orderToken);
  if (!row) throw new CommerceError("Cart not found", "not_found");
  return row;
}

export async function getCart(orderToken: string | null): Promise<Cart | null> {
  if (!orderToken) return null;
  const row = await findOpenOrderByToken(orderToken);
  return row ? hydrateOrder(row.id) : null;
}

export async function createCart(userId: number | null): Promise<Cart> {
  const [row] = await db
    .insert(s.orders)
    .values({ number: generateOrderNumber(), token: generateToken(), userId, state: "cart" })
    .returning();
  return hydrateOrder(row.id);
}

export async function getCustomerCart(userId: number): Promise<Cart | null> {
  const [row] = await db
    .select()
    .from(s.orders)
    .where(and(eq(s.orders.userId, userId), ne(s.orders.state, "complete")))
    .orderBy(s.orders.updatedAt)
    .limit(1);
  return row ? hydrateOrder(row.id) : null;
}

async function assertAvailable(variantId: number, requestedQuantity: number) {
  const catalog = await loadCatalog();
  for (const product of catalog.products) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) continue;
    if (!variant.stock.purchasable) {
      throw new CommerceError(`${product.name} in this size is out of stock`, "out_of_stock");
    }
    if (!variant.stock.backorderable && requestedQuantity > variant.stock.countOnHand) {
      throw new CommerceError(
        variant.stock.countOnHand === 1
          ? `Only 1 of this item is available`
          : `Only ${variant.stock.countOnHand} of this item are available`,
        "out_of_stock",
      );
    }
    return { product, variant };
  }
  throw new CommerceError("Variant not found", "not_found");
}

export async function addToCart(orderToken: string, variantId: number, quantity: number): Promise<Cart> {
  const order = await requireOpenOrder(orderToken);
  const qty = Math.max(1, Math.floor(quantity));
  const [existing] = await db
    .select()
    .from(s.lineItems)
    .where(and(eq(s.lineItems.orderId, order.id), eq(s.lineItems.variantId, variantId)));
  const { variant } = await assertAvailable(variantId, (existing?.quantity ?? 0) + qty);

  if (existing) {
    await db
      .update(s.lineItems)
      .set({ quantity: existing.quantity + qty })
      .where(eq(s.lineItems.id, existing.id));
  } else {
    await db.insert(s.lineItems).values({
      orderId: order.id,
      variantId,
      quantity: qty,
      priceCents: variant.priceCents,
    });
  }

  // Any change to the cart returns the checkout to the start (as Spree does).
  await db.update(s.orders).set({ state: order.state === "cart" ? "cart" : "address" }).where(eq(s.orders.id, order.id));
  await recalculateOrder(order.id);
  return hydrateOrder(order.id);
}

export async function setLineItemQuantity(orderToken: string, lineItemId: number, quantity: number): Promise<Cart> {
  const order = await requireOpenOrder(orderToken);
  const [item] = await db
    .select()
    .from(s.lineItems)
    .where(and(eq(s.lineItems.id, lineItemId), eq(s.lineItems.orderId, order.id)));
  if (!item) throw new CommerceError("Item not found in cart", "not_found");

  const qty = Math.floor(quantity);
  if (qty <= 0) {
    await db.delete(s.lineItems).where(eq(s.lineItems.id, item.id));
  } else {
    await assertAvailable(item.variantId, qty);
    await db.update(s.lineItems).set({ quantity: qty }).where(eq(s.lineItems.id, item.id));
  }
  await recalculateOrder(order.id);
  return hydrateOrder(order.id);
}

export async function removeLineItem(orderToken: string, lineItemId: number): Promise<Cart> {
  const order = await requireOpenOrder(orderToken);
  await db.delete(s.lineItems).where(and(eq(s.lineItems.id, lineItemId), eq(s.lineItems.orderId, order.id)));
  await recalculateOrder(order.id);
  return hydrateOrder(order.id);
}

/**
 * Attach a guest cart to a customer. If the customer already has an open cart
 * its items are merged into the current one and the stale cart is removed.
 */
export async function associateCart(orderToken: string, userId: number): Promise<Cart> {
  const order = await requireOpenOrder(orderToken);
  const stale = await db
    .select()
    .from(s.orders)
    .where(and(eq(s.orders.userId, userId), ne(s.orders.state, "complete"), ne(s.orders.id, order.id)));

  for (const old of stale) {
    const oldItems = await db.select().from(s.lineItems).where(eq(s.lineItems.orderId, old.id));
    for (const li of oldItems) {
      const [existing] = await db
        .select()
        .from(s.lineItems)
        .where(and(eq(s.lineItems.orderId, order.id), eq(s.lineItems.variantId, li.variantId)));
      if (existing) {
        await db
          .update(s.lineItems)
          .set({ quantity: existing.quantity + li.quantity })
          .where(eq(s.lineItems.id, existing.id));
      } else {
        await db.insert(s.lineItems).values({
          orderId: order.id,
          variantId: li.variantId,
          quantity: li.quantity,
          priceCents: li.priceCents,
        });
      }
    }
    await db.delete(s.orders).where(eq(s.orders.id, old.id));
  }

  await db.update(s.orders).set({ userId, updatedAt: new Date() }).where(eq(s.orders.id, order.id));
  await recalculateOrder(order.id);
  return hydrateOrder(order.id);
}
