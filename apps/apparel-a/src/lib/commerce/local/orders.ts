import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import type { Order, OrderSummary, ShipmentState } from "../types";
import { loadCatalog } from "./catalog";
import { syncShipmentTracking } from "./fulfilment";
import { hydrateOrder } from "./hydrate";
import { iso } from "./shared";

export async function getOrderByNumber(
  number: string,
  access: { orderToken?: string | null; userId?: number | null },
): Promise<Order | null> {
  const [row] = await db.select().from(s.orders).where(eq(s.orders.number, number)).limit(1);
  if (!row) return null;

  const tokenMatches = Boolean(access.orderToken && row.token === access.orderToken);
  const userMatches = Boolean(access.userId && row.userId === access.userId);
  if (!tokenMatches && !userMatches) return null;

  if (row.state === "complete") await syncShipmentTracking(row.id);
  return hydrateOrder(row.id);
}

export async function listOrders(userId: number): Promise<OrderSummary[]> {
  const rows = await db
    .select()
    .from(s.orders)
    .where(and(eq(s.orders.userId, userId), eq(s.orders.state, "complete")))
    .orderBy(desc(s.orders.completedAt));
  if (rows.length === 0) return [];

  // Keep in-flight shipments moving before we display their status.
  for (const row of rows) {
    if (row.shipmentState !== "delivered") await syncShipmentTracking(row.id);
  }
  const refreshed = await db
    .select()
    .from(s.orders)
    .where(inArray(s.orders.id, rows.map((r) => r.id)))
    .orderBy(desc(s.orders.completedAt));

  const items = await db
    .select()
    .from(s.lineItems)
    .where(inArray(s.lineItems.orderId, rows.map((r) => r.id)))
    .orderBy(asc(s.lineItems.id));
  const catalog = await loadCatalog();
  const variantToProduct = new Map<number, { name: string; thumbnailUrl: string | null }>();
  for (const p of catalog.products) {
    for (const v of p.variants) variantToProduct.set(v.id, { name: p.name, thumbnailUrl: p.thumbnailUrl });
  }

  return refreshed.map((o) => {
    const orderItems = items.filter((li) => li.orderId === o.id);
    const products = orderItems.map((li) => variantToProduct.get(li.variantId)).filter(Boolean);
    return {
      id: o.id,
      number: o.number,
      state: "complete",
      itemCount: orderItems.reduce((sum, li) => sum + li.quantity, 0),
      totalCents: o.totalCents,
      paymentState: o.paymentState,
      shipmentState: (o.shipmentState as ShipmentState | null) ?? null,
      completedAt: iso(o.completedAt),
      thumbnailUrls: products.map((p) => p!.thumbnailUrl).filter((u): u is string => Boolean(u)).slice(0, 3),
      firstItemName: products[0]?.name ?? null,
    };
  });
}
