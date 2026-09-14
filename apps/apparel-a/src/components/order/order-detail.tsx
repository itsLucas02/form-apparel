import Image from "next/image";
import Link from "next/link";
import { Check, MapPin, Package, Truck } from "lucide-react";
import { AutoRefresh, CopyButton } from "@/components/order/order-client";
import { Badge, DefinitionList, Notice, StatusPill } from "@/components/ui";
import type { Order, Shipment } from "@/lib/commerce/types";
import { cn, formatDate, formatDateTime, formatWeekday, formatZAR, variantLabel } from "@/lib/format";
import { formatAddressLines } from "@/lib/za";

export function OrderDetail({
  order,
  justPlaced = false,
  backHref,
  backLabel,
}: {
  order: Order;
  justPlaced?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  const shipment = order.shipments[0];
  const payment = order.payments.find((p) => p.state === "completed") ?? order.payments[0];
  const inFlight = Boolean(shipment && shipment.state !== "delivered");

  return (
    <div className="container-x fade-in pt-8 sm:pt-12">
      {inFlight && <AutoRefresh intervalMs={30_000} />}

      {backHref && (
        <Link href={backHref} className="label link-underline text-stone-500">
          ← {backLabel ?? "Back"}
        </Link>
      )}

      {justPlaced ? (
        <div className="mt-6 max-w-2xl">
          <p className="label text-success">Order confirmed</p>
          <h1 className="display mt-3 text-[44px] leading-[1] sm:text-[64px]">
            Thank you{order.shipAddress ? `, ${order.shipAddress.firstName}` : ""}.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-stone-600">
            Your order <span className="font-medium text-ink">{order.number}</span> is confirmed and being packed at our Cape
            Town warehouse. A confirmation has been sent to <span className="text-ink">{order.email}</span>; we&apos;ll email
            again with tracking once the courier collects.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label text-stone-500">Order</p>
            <h1 className="display mt-2 text-[40px] sm:text-[52px]">{order.number}</h1>
            <p className="mt-2 text-[14px] text-stone-500">Placed {formatDate(order.completedAt)}</p>
          </div>
          <div className="flex gap-2">
            <StatusPill status={order.paymentState} />
            <StatusPill status={order.shipmentState} />
          </div>
        </div>
      )}

      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-12">
          {shipment && <ShipmentCard shipment={shipment} order={order} />}

          <section>
            <h2 className="text-[17px] font-medium">Items</h2>
            <ul className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
              {order.lineItems.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <Link href={`/products/${item.product.slug}`} className="relative w-20 shrink-0 bg-bone-deep" style={{ aspectRatio: "4 / 5" }}>
                    {item.variant.imageUrl && <Image src={item.variant.imageUrl} alt="" fill sizes="80px" className="object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link href={`/products/${item.product.slug}`} className="block truncate text-[14px] font-medium">
                          {item.product.name}
                        </Link>
                        <p className="mt-0.5 text-[13px] text-stone-500">{variantLabel(item.variant.color, item.variant.size)}</p>
                        <p className="mt-0.5 text-[12px] text-stone-400">SKU {item.variant.sku}</p>
                      </div>
                      <p className="shrink-0 text-[14px] tabular-nums">{formatZAR(item.totalCents)}</p>
                    </div>
                    <p className="text-[13px] text-stone-500">
                      Qty {item.quantity} × {formatZAR(item.priceCents)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="mt-12 space-y-8 lg:mt-0">
          <section className="border border-stone-200 bg-white p-6">
            <h2 className="text-[15px] font-medium">Summary</h2>
            <dl className="mt-4 space-y-2 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-stone-500">Subtotal</dt>
                <dd className="tabular-nums">{formatZAR(order.itemTotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Delivery{order.shippingMethod ? ` · ${order.shippingMethod.name}` : ""}</dt>
                <dd className="tabular-nums">{order.shipmentTotalCents === 0 ? "Free" : formatZAR(order.shipmentTotalCents)}</dd>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 text-[17px]">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatZAR(order.totalCents)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[12px] text-stone-400">Includes 15% VAT.</p>
          </section>

          <section>
            <h2 className="label text-stone-500">Delivery address</h2>
            {order.shipAddress && (
              <address className="mt-3 text-[14px] not-italic leading-relaxed">
                {formatAddressLines(order.shipAddress).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="mt-1 block text-stone-500">{order.shipAddress.phone}</span>
              </address>
            )}
          </section>

          <section>
            <h2 className="label text-stone-500">Payment</h2>
            {payment && (
              <div className="mt-3 text-[14px] leading-relaxed">
                <p>
                  {payment.cardLast4 ? `${payment.cardBrand ?? "Card"} ending ${payment.cardLast4}` : payment.method.name}
                </p>
                <p className="text-stone-500">
                  {formatZAR(payment.amountCents)} · {payment.state === "completed" ? "Paid" : payment.state}
                </p>
                {payment.reference && <p className="text-[12px] text-stone-400">Ref {payment.reference}</p>}
              </div>
            )}
          </section>

          <section>
            <h2 className="label text-stone-500">Need help?</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-stone-600">
              Exchanges and returns are free within 30 days.{" "}
              <Link href="/help#returns" className="text-ink underline underline-offset-4">
                Start a return
              </Link>{" "}
              or{" "}
              <Link href="/help#contact" className="text-ink underline underline-offset-4">
                contact us
              </Link>
              .
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shipment / tracking                                                 */
/* ------------------------------------------------------------------ */

const MILESTONES: Array<{ id: string; label: string; states: Shipment["state"][] }> = [
  { id: "confirmed", label: "Confirmed", states: ["pending", "ready", "shipped", "delivered"] },
  { id: "dispatched", label: "Dispatched", states: ["shipped", "delivered"] },
  { id: "in_transit", label: "In transit", states: ["shipped", "delivered"] },
  { id: "delivered", label: "Delivered", states: ["delivered"] },
];

function ShipmentCard({ shipment, order }: { shipment: Shipment; order: Order }) {
  const events = [...shipment.events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const latest = events[0];
  const outForDelivery = events.some((e) => e.code === "out_for_delivery");
  const reachedIndex =
    shipment.state === "delivered" ? 3 : outForDelivery ? 2 : shipment.state === "shipped" ? (events.some((e) => e.code === "in_transit") ? 2 : 1) : 0;

  return (
    <section id="tracking" className="border border-stone-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 p-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[17px] font-medium">Shipment</h2>
            <StatusPill status={shipment.state} />
          </div>
          <p className="mt-1.5 text-[14px] text-stone-500">
            {shipment.state === "delivered"
              ? `Delivered ${formatDateTime(shipment.deliveredAt)}`
              : shipment.estimatedDelivery
                ? `Estimated delivery ${formatWeekday(shipment.estimatedDelivery)}`
                : "Preparing your parcel"}
          </p>
        </div>
        {shipment.trackingUrl ? (
          <a href={shipment.trackingUrl} target="_blank" rel="noreferrer" className="btn-secondary h-10 px-4">
            Track with courier
          </a>
        ) : (
          <a href="#tracking-history" className="btn-secondary h-10 px-4">
            Tracking history
          </a>
        )}
      </div>

      {/* Milestones */}
      <ol className="grid grid-cols-4 gap-2 px-6 pt-6">
        {MILESTONES.map((m, i) => {
          const done = i <= reachedIndex;
          const current = i === reachedIndex && shipment.state !== "delivered";
          return (
            <li key={m.id} className="min-w-0">
              <div className={cn("h-1 w-full transition-colors", done ? "bg-ink" : "bg-stone-200")} />
              <p className={cn("mt-2 flex items-center gap-1.5 truncate text-[11px] font-medium uppercase tracking-label", done ? "text-ink" : "text-stone-400")}>
                {current && <span className="size-1.5 rounded-full bg-ink pulse-dot" />}
                {m.label}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 p-6 sm:grid-cols-3">
        <div>
          <p className="label text-stone-400">Courier</p>
          <p className="mt-1.5 flex items-center gap-2 text-[14px]">
            <Truck className="size-4 text-stone-400" /> {shipment.courierName ?? "To be assigned"}
          </p>
        </div>
        <div>
          <p className="label text-stone-400">Tracking number</p>
          {shipment.trackingNumber ? (
            <CopyButton value={shipment.trackingNumber} className="mt-1.5 text-[14px] tabular-nums" />
          ) : (
            <p className="mt-1.5 text-[14px] text-stone-400">Issued on dispatch</p>
          )}
        </div>
        <div>
          <p className="label text-stone-400">Waybill</p>
          <p className="mt-1.5 flex items-center gap-2 text-[14px] tabular-nums">
            <Package className="size-4 text-stone-400" /> {shipment.waybillNumber ?? "—"}
          </p>
          <p className="text-[12px] text-stone-400">Shipment {shipment.number}</p>
        </div>
      </div>

      <div id="tracking-history" className="border-t border-stone-200 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-medium">Tracking history</h3>
          {order.shipAddress && (
            <p className="flex items-center gap-1.5 text-[12px] text-stone-500">
              <MapPin className="size-3.5" /> {order.shipAddress.city}, {order.shipAddress.province}
            </p>
          )}
        </div>
        {events.length === 0 ? (
          <p className="mt-4 text-[14px] text-stone-500">Waiting for the first scan from the courier.</p>
        ) : (
          <ol className="mt-5">
            {events.map((e, i) => {
              const isLatest = i === 0;
              return (
                <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < events.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-stone-200" aria-hidden />}
                  <span
                    className={cn(
                      "relative mt-1 flex size-[15px] shrink-0 items-center justify-center rounded-full border",
                      isLatest ? "border-ink bg-ink text-bone" : "border-stone-300 bg-white",
                    )}
                  >
                    {isLatest && <Check className="size-2.5" strokeWidth={3} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className={cn("text-[14px] font-medium", !isLatest && "text-stone-600")}>{e.title}</p>
                      <p className="text-[12px] tabular-nums text-stone-400">{formatDateTime(e.occurredAt)}</p>
                    </div>
                    <p className="mt-0.5 text-[13px] text-stone-500">{e.description}</p>
                    {e.location && <p className="mt-0.5 text-[12px] text-stone-400">{e.location}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {latest && shipment.state !== "delivered" && (
          <Notice tone="info" className="mt-6 text-[13px]">
            <span className="font-medium">Demo courier.</span> Tracking events are simulated and progress over the next few
            minutes — this page refreshes automatically. A real South African courier integration will supply this data.
          </Notice>
        )}
        {shipment.state === "delivered" && (
          <div className="mt-6 flex items-center gap-2 text-[13px] text-success">
            <Badge tone="success">Delivered</Badge> Enjoy. Let us know if anything isn&apos;t right.
          </div>
        )}
      </div>
    </section>
  );
}

export function OrderMeta({ order }: { order: Order }) {
  return (
    <DefinitionList
      items={[
        { term: "Order number", value: order.number },
        { term: "Placed", value: formatDate(order.completedAt) },
        { term: "Email", value: order.email ?? "—" },
      ]}
    />
  );
}
