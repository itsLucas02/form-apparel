import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import { courier } from "./providers";
import { mapAddress } from "./shared";

const STATE_BY_EVENT: Record<string, "pending" | "ready" | "shipped" | "delivered"> = {
  order_confirmed: "pending",
  waybill_created: "ready",
  collected: "shipped",
  in_transit: "shipped",
  arrived_depot: "shipped",
  out_for_delivery: "shipped",
  delivered: "delivered",
};

/**
 * Pull the latest tracking history from the courier provider and persist any
 * new events, then roll the shipment/order status forward.
 *
 * With a real courier this is what a tracking webhook or a scheduled poll
 * would do; here it is invoked lazily whenever an order is viewed.
 */
export async function syncShipmentTracking(orderId: number): Promise<void> {
  const [order] = await db.select().from(s.orders).where(eq(s.orders.id, orderId));
  if (!order || order.state !== "complete" || !order.shipAddressId || !order.completedAt) return;

  const openShipments = await db
    .select()
    .from(s.shipments)
    .where(and(eq(s.shipments.orderId, orderId), ne(s.shipments.state, "delivered")));
  if (openShipments.length === 0) return;

  const [addressRow] = await db.select().from(s.addresses).where(eq(s.addresses.id, order.shipAddressId));
  const [method] = order.shippingMethodId
    ? await db.select().from(s.shippingMethods).where(eq(s.shippingMethods.id, order.shippingMethodId))
    : [];
  if (!addressRow) return;
  const destination = mapAddress(addressRow);

  for (const shipment of openShipments) {
    if (!shipment.trackingNumber) continue;
    const events = await courier.getTrackingEvents({
      trackingNumber: shipment.trackingNumber,
      bookedAt: shipment.createdAt,
      destination,
      shippingMethodCode: method?.code ?? "standard",
      recipientFirstName: destination.firstName,
    });
    if (events.length === 0) continue;

    const existing = await db
      .select({ code: s.trackingEvents.code })
      .from(s.trackingEvents)
      .where(eq(s.trackingEvents.shipmentId, shipment.id));
    const known = new Set(existing.map((e) => e.code));
    const fresh = events.filter((e) => !known.has(e.code));

    if (fresh.length > 0) {
      await db.insert(s.trackingEvents).values(
        fresh.map((e) => ({
          shipmentId: shipment.id,
          code: e.code,
          title: e.title,
          description: e.description,
          location: e.location,
          occurredAt: e.occurredAt,
        })),
      );
    }

    const latest = events[events.length - 1];
    const nextState = STATE_BY_EVENT[latest.code] ?? shipment.state;
    if (nextState !== shipment.state) {
      const shippedEvent = events.find((e) => e.code === "collected");
      const deliveredEvent = events.find((e) => e.code === "delivered");
      await db
        .update(s.shipments)
        .set({
          state: nextState,
          shippedAt: shippedEvent?.occurredAt ?? shipment.shippedAt,
          deliveredAt: deliveredEvent?.occurredAt ?? shipment.deliveredAt,
          updatedAt: new Date(),
        })
        .where(eq(s.shipments.id, shipment.id));
      await db
        .update(s.orders)
        .set({ shipmentState: nextState, updatedAt: new Date() })
        .where(eq(s.orders.id, orderId));
    }
  }
}
