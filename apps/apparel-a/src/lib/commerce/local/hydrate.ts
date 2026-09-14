import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import type {
  LineItem,
  Order,
  OrderState,
  Payment,
  PaymentMethod,
  PaymentState,
  Shipment,
  ShipmentState,
  ShippingMethod,
} from "../types";
import { loadCatalog } from "./catalog";
import { iso, isoRequired, mapAddress } from "./shared";

export function mapShippingMethod(row: typeof s.shippingMethods.$inferSelect): ShippingMethod {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    costCents: row.costCents,
    freeAboveCents: row.freeAboveCents,
    etaMinDays: row.etaMinDays,
    etaMaxDays: row.etaMaxDays,
  };
}

export function mapPaymentMethod(row: typeof s.paymentMethods.$inferSelect): PaymentMethod {
  return { id: row.id, code: row.code, name: row.name, description: row.description };
}

/** Effective shipping cost for a method given the order's item total. */
export function shippingCostFor(method: ShippingMethod, itemTotalCents: number): number {
  if (method.freeAboveCents != null && itemTotalCents >= method.freeAboveCents) return 0;
  return method.costCents;
}

export async function hydrateOrders(orderIds: number[]): Promise<Map<number, Order>> {
  if (orderIds.length === 0) return new Map();

  const [orderRows, lineItemRows, paymentRows, shipmentRows, shippingMethodRows, paymentMethodRows] =
    await Promise.all([
      db.select().from(s.orders).where(inArray(s.orders.id, orderIds)),
      db
        .select()
        .from(s.lineItems)
        .where(inArray(s.lineItems.orderId, orderIds))
        .orderBy(asc(s.lineItems.createdAt), asc(s.lineItems.id)),
      db.select().from(s.payments).where(inArray(s.payments.orderId, orderIds)).orderBy(asc(s.payments.id)),
      db.select().from(s.shipments).where(inArray(s.shipments.orderId, orderIds)).orderBy(asc(s.shipments.id)),
      db.select().from(s.shippingMethods),
      db.select().from(s.paymentMethods),
    ]);

  const addressIds = [
    ...new Set(
      orderRows.flatMap((o) => [o.shipAddressId, o.billAddressId]).filter((id): id is number => id != null),
    ),
  ];
  const shipmentIds = shipmentRows.map((sh) => sh.id);
  const [addressRows, eventRows] = await Promise.all([
    addressIds.length ? db.select().from(s.addresses).where(inArray(s.addresses.id, addressIds)) : [],
    shipmentIds.length
      ? db
          .select()
          .from(s.trackingEvents)
          .where(inArray(s.trackingEvents.shipmentId, shipmentIds))
          .orderBy(asc(s.trackingEvents.occurredAt), asc(s.trackingEvents.id))
      : [],
  ]);

  const catalog = await loadCatalog();
  const variantIndex = new Map<number, { product: (typeof catalog.products)[number]; variant: (typeof catalog.products)[number]["variants"][number] }>();
  for (const product of catalog.products) {
    for (const variant of product.variants) variantIndex.set(variant.id, { product, variant });
  }

  const addressById = new Map(addressRows.map((a) => [a.id, mapAddress(a)]));
  const shippingMethodById = new Map(shippingMethodRows.map((m) => [m.id, mapShippingMethod(m)]));
  const paymentMethodById = new Map(paymentMethodRows.map((m) => [m.id, mapPaymentMethod(m)]));

  const lineItemsByOrder = new Map<number, LineItem[]>();
  for (const li of lineItemRows) {
    const entry = variantIndex.get(li.variantId);
    if (!entry) continue;
    const { product, variant } = entry;
    const colourImage = variant.color
      ? product.images.find((img) => img.optionValueId === variant.color?.id)
      : undefined;
    const item: LineItem = {
      id: li.id,
      variantId: li.variantId,
      quantity: li.quantity,
      priceCents: li.priceCents,
      totalCents: li.priceCents * li.quantity,
      product: { id: product.id, name: product.name, slug: product.slug },
      variant: {
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        imageUrl: colourImage?.url ?? product.thumbnailUrl,
        stock: variant.stock,
      },
    };
    const list = lineItemsByOrder.get(li.orderId) ?? [];
    list.push(item);
    lineItemsByOrder.set(li.orderId, list);
  }

  const paymentsByOrder = new Map<number, Payment[]>();
  for (const p of paymentRows) {
    const method = paymentMethodById.get(p.paymentMethodId);
    if (!method) continue;
    const list = paymentsByOrder.get(p.orderId) ?? [];
    list.push({
      id: p.id,
      method,
      amountCents: p.amountCents,
      state: p.state as PaymentState,
      reference: p.reference,
      cardBrand: p.cardBrand,
      cardLast4: p.cardLast4,
      createdAt: isoRequired(p.createdAt),
    });
    paymentsByOrder.set(p.orderId, list);
  }

  const eventsByShipment = new Map<number, Shipment["events"]>();
  for (const e of eventRows) {
    const list = eventsByShipment.get(e.shipmentId) ?? [];
    list.push({
      id: e.id,
      code: e.code,
      title: e.title,
      description: e.description,
      location: e.location,
      occurredAt: isoRequired(e.occurredAt),
    });
    eventsByShipment.set(e.shipmentId, list);
  }

  const shipmentsByOrder = new Map<number, Shipment[]>();
  for (const sh of shipmentRows) {
    const list = shipmentsByOrder.get(sh.orderId) ?? [];
    list.push({
      id: sh.id,
      number: sh.number,
      state: sh.state as ShipmentState,
      courierName: sh.courierName,
      waybillNumber: sh.waybillNumber,
      trackingNumber: sh.trackingNumber,
      trackingUrl: sh.trackingUrl,
      estimatedDelivery: iso(sh.estimatedDelivery),
      shippedAt: iso(sh.shippedAt),
      deliveredAt: iso(sh.deliveredAt),
      events: eventsByShipment.get(sh.id) ?? [],
    });
    shipmentsByOrder.set(sh.orderId, list);
  }

  const result = new Map<number, Order>();
  for (const o of orderRows) {
    const lineItems = lineItemsByOrder.get(o.id) ?? [];
    result.set(o.id, {
      id: o.id,
      number: o.number,
      token: o.token,
      state: o.state as OrderState,
      email: o.email,
      currency: o.currency,
      itemCount: lineItems.reduce((sum, li) => sum + li.quantity, 0),
      itemTotalCents: o.itemTotalCents,
      shipmentTotalCents: o.shipmentTotalCents,
      totalCents: o.totalCents,
      shipAddress: o.shipAddressId ? (addressById.get(o.shipAddressId) ?? null) : null,
      billAddress: o.billAddressId ? (addressById.get(o.billAddressId) ?? null) : null,
      shippingMethod: o.shippingMethodId ? (shippingMethodById.get(o.shippingMethodId) ?? null) : null,
      paymentState: o.paymentState,
      shipmentState: (o.shipmentState as ShipmentState | null) ?? null,
      lineItems,
      payments: paymentsByOrder.get(o.id) ?? [],
      shipments: shipmentsByOrder.get(o.id) ?? [],
      completedAt: iso(o.completedAt),
      createdAt: isoRequired(o.createdAt),
      updatedAt: isoRequired(o.updatedAt),
    });
  }
  return result;
}

export async function hydrateOrder(orderId: number): Promise<Order> {
  const map = await hydrateOrders([orderId]);
  const order = map.get(orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  return order;
}

/** Recompute item/shipping totals after any line item or shipping change. */
export async function recalculateOrder(orderId: number): Promise<void> {
  const [orderRow] = await db.select().from(s.orders).where(eq(s.orders.id, orderId));
  if (!orderRow) return;
  const items = await db.select().from(s.lineItems).where(eq(s.lineItems.orderId, orderId));
  const itemTotal = items.reduce((sum, li) => sum + li.priceCents * li.quantity, 0);
  const itemCount = items.reduce((sum, li) => sum + li.quantity, 0);

  let shipmentTotal = 0;
  if (orderRow.shippingMethodId) {
    const [method] = await db
      .select()
      .from(s.shippingMethods)
      .where(eq(s.shippingMethods.id, orderRow.shippingMethodId));
    if (method) shipmentTotal = shippingCostFor(mapShippingMethod(method), itemTotal);
  }

  await db
    .update(s.orders)
    .set({
      itemCount,
      itemTotalCents: itemTotal,
      shipmentTotalCents: shipmentTotal,
      totalCents: itemTotal + shipmentTotal,
      updatedAt: new Date(),
    })
    .where(eq(s.orders.id, orderId));
}
