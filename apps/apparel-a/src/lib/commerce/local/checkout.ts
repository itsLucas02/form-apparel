import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import {
  CommerceError,
  type AddressInput,
  type CardPaymentInput,
  type Cart,
  type Order,
  type PaymentMethod,
  type ShippingMethod,
} from "../types";
import { requireOpenOrder } from "./cart";
import { hydrateOrder, mapPaymentMethod, mapShippingMethod, recalculateOrder, shippingCostFor } from "./hydrate";
import { syncShipmentTracking } from "./fulfilment";
import { courier, paymentGateway } from "./providers";
import { generateShipmentNumber, mapAddress } from "./shared";

export async function listShippingMethods(orderToken: string): Promise<ShippingMethod[]> {
  const order = await requireOpenOrder(orderToken);
  const rows = await db.select().from(s.shippingMethods).orderBy(asc(s.shippingMethods.position));
  return rows.map((row) => {
    const method = mapShippingMethod(row);
    return { ...method, costCents: shippingCostFor(method, order.itemTotalCents) };
  });
}

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  const rows = await db
    .select()
    .from(s.paymentMethods)
    .where(eq(s.paymentMethods.active, true))
    .orderBy(asc(s.paymentMethods.position));
  return rows.map(mapPaymentMethod);
}

export async function checkoutSetAddress(
  orderToken: string,
  input: { email: string; address: AddressInput; saveToAccount?: boolean; userId?: number | null },
): Promise<Cart> {
  const order = await requireOpenOrder(orderToken);
  if (order.itemCount === 0) throw new CommerceError("Your cart is empty", "invalid_state");

  const saveToAccount = Boolean(input.saveToAccount && input.userId);
  const [address] = await db
    .insert(s.addresses)
    .values({
      userId: saveToAccount ? input.userId : null,
      firstName: input.address.firstName,
      lastName: input.address.lastName,
      company: input.address.company || null,
      address1: input.address.address1,
      address2: input.address.address2 || null,
      city: input.address.city,
      province: input.address.province,
      postalCode: input.address.postalCode,
      phone: input.address.phone,
      label: input.address.label || null,
      isDefault: false,
    })
    .returning();

  if (saveToAccount && input.userId) {
    const existing = await db
      .select({ id: s.addresses.id })
      .from(s.addresses)
      .where(and(eq(s.addresses.userId, input.userId), eq(s.addresses.isDefault, true)));
    if (existing.length === 0) {
      await db.update(s.addresses).set({ isDefault: true }).where(eq(s.addresses.id, address.id));
    }
  }

  await db
    .update(s.orders)
    .set({
      email: input.email,
      shipAddressId: address.id,
      billAddressId: address.id,
      state: "delivery",
      updatedAt: new Date(),
    })
    .where(eq(s.orders.id, order.id));

  await recalculateOrder(order.id);
  return hydrateOrder(order.id);
}

export async function checkoutSetShippingMethod(orderToken: string, shippingMethodCode: string): Promise<Cart> {
  const order = await requireOpenOrder(orderToken);
  if (!order.shipAddressId) throw new CommerceError("Please add a delivery address first", "invalid_state");
  const [method] = await db.select().from(s.shippingMethods).where(eq(s.shippingMethods.code, shippingMethodCode));
  if (!method) throw new CommerceError("Unknown delivery option", "validation");

  await db
    .update(s.orders)
    .set({ shippingMethodId: method.id, state: "payment", updatedAt: new Date() })
    .where(eq(s.orders.id, order.id));
  await recalculateOrder(order.id);
  return hydrateOrder(order.id);
}

function detectCardBrand(cardNumber: string): string {
  if (/^4/.test(cardNumber)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) return "Mastercard";
  if (/^3[47]/.test(cardNumber)) return "American Express";
  return "Card";
}

export async function checkoutSetPayment(orderToken: string, input: CardPaymentInput): Promise<Cart> {
  const order = await requireOpenOrder(orderToken);
  if (!order.shippingMethodId) throw new CommerceError("Please choose a delivery option first", "invalid_state");
  const [method] = await db.select().from(s.paymentMethods).where(eq(s.paymentMethods.code, input.methodCode));
  if (!method || !method.active) throw new CommerceError("Unknown payment method", "validation");

  const digits = (input.cardNumber ?? "").replace(/\D/g, "");
  const isCard = method.code === "demo_card";

  // Replace any earlier, unfinished payment attempts (Spree keeps one "checkout" payment).
  await db
    .delete(s.payments)
    .where(and(eq(s.payments.orderId, order.id), inArray(s.payments.state, ["checkout", "failed"])));
  await db.insert(s.payments).values({
    orderId: order.id,
    paymentMethodId: method.id,
    amountCents: order.totalCents,
    state: "checkout",
    cardBrand: isCard && digits ? detectCardBrand(digits) : null,
    cardLast4: isCard && digits ? digits.slice(-4) : null,
  });

  await db.update(s.orders).set({ state: "confirm", updatedAt: new Date() }).where(eq(s.orders.id, order.id));
  return hydrateOrder(order.id);
}

export async function checkoutRewind(orderToken: string, state: "address" | "delivery" | "payment"): Promise<Cart> {
  const order = await requireOpenOrder(orderToken);
  await db.update(s.orders).set({ state, updatedAt: new Date() }).where(eq(s.orders.id, order.id));
  return hydrateOrder(order.id);
}

/**
 * Finalise the order:
 *   capture payment → mark complete → reserve stock → book shipment.
 * This mirrors Spree's `order.complete!` + shipment creation, and is the
 * seam where a real payment provider / courier integration plugs in.
 */
export async function completeCheckout(orderToken: string): Promise<Order> {
  const orderRow = await requireOpenOrder(orderToken);
  if (orderRow.state !== "confirm") throw new CommerceError("Order is not ready to be placed", "invalid_state");
  const order = await hydrateOrder(orderRow.id);
  if (!order.shipAddress || !order.shippingMethod) {
    throw new CommerceError("Delivery details are incomplete", "invalid_state");
  }

  const payment = order.payments.find((p) => p.state === "checkout");
  if (!payment) throw new CommerceError("Please add a payment method", "invalid_state");

  // Re-validate stock right before capturing payment.
  for (const item of order.lineItems) {
    if (!item.variant.stock.purchasable || (!item.variant.stock.backorderable && item.quantity > item.variant.stock.countOnHand)) {
      throw new CommerceError(
        `${item.product.name} (${[item.variant.color?.presentation, item.variant.size?.presentation].filter(Boolean).join(" / ")}) is no longer available in that quantity`,
        "out_of_stock",
      );
    }
  }

  const result = await paymentGateway.authorizeAndCapture({
    orderNumber: order.number,
    amountCents: order.totalCents,
    currency: order.currency,
    methodCode: payment.method.code,
    card: { brand: payment.cardBrand, last4: payment.cardLast4 },
  });

  if (!result.success) {
    await db.update(s.payments).set({ state: "failed" }).where(eq(s.payments.id, payment.id));
    await db.update(s.orders).set({ state: "payment", paymentState: "failed" }).where(eq(s.orders.id, order.id));
    throw new CommerceError(result.message, "payment_failed");
  }

  const completedAt = new Date();
  const shipmentNumber = generateShipmentNumber();

  await db.transaction(async (tx) => {
    await tx
      .update(s.payments)
      .set({ state: "completed", reference: result.reference })
      .where(eq(s.payments.id, payment.id));

    for (const item of order.lineItems) {
      await tx
        .update(s.stockItems)
        .set({ countOnHand: sql`${s.stockItems.countOnHand} - ${item.quantity}` })
        .where(eq(s.stockItems.variantId, item.variantId));
    }

    await tx
      .update(s.orders)
      .set({
        state: "complete",
        completedAt,
        paymentState: "paid",
        shipmentState: "pending",
        updatedAt: completedAt,
      })
      .where(eq(s.orders.id, order.id));
  });

  const booking = await courier.createShipment({
    orderNumber: order.number,
    shipmentNumber,
    destination: order.shipAddress,
    shippingMethodCode: order.shippingMethod.code,
    etaMaxDays: order.shippingMethod.etaMaxDays,
    itemCount: order.itemCount,
  });

  await db.insert(s.shipments).values({
    orderId: order.id,
    number: shipmentNumber,
    state: "pending",
    courierName: booking.courierName,
    waybillNumber: booking.waybillNumber,
    trackingNumber: booking.trackingNumber,
    trackingUrl: booking.trackingUrl,
    estimatedDelivery: booking.estimatedDelivery,
    createdAt: completedAt,
    updatedAt: completedAt,
  });

  await syncShipmentTracking(order.id);
  return hydrateOrder(order.id);
}

export { mapAddress };
