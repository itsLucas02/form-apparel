import Image from "next/image";
import type { Order } from "@/lib/commerce/types";
import { formatZAR, variantLabel } from "@/lib/format";

export function OrderSummary({ order }: { order: Order }) {
  return (
    <div>
      <ul className="max-h-[40vh] space-y-4 overflow-y-auto pr-1">
        {order.lineItems.map((item) => (
          <li key={item.id} className="flex items-center gap-4">
            <div className="relative w-14 shrink-0 bg-bone-deep" style={{ aspectRatio: "4 / 5" }}>
              {item.variant.imageUrl && <Image src={item.variant.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-ink text-[10px] text-bone">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">{item.product.name}</p>
              <p className="text-[12px] text-stone-500">{variantLabel(item.variant.color, item.variant.size)}</p>
            </div>
            <p className="text-[14px] tabular-nums">{formatZAR(item.totalCents)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-2 border-t border-stone-200 pt-4 text-[14px]">
        <div className="flex justify-between">
          <dt className="text-stone-500">Subtotal</dt>
          <dd className="tabular-nums">{formatZAR(order.itemTotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-500">Delivery</dt>
          <dd className="tabular-nums">
            {order.shippingMethod ? (order.shipmentTotalCents === 0 ? "Free" : formatZAR(order.shipmentTotalCents)) : <span className="text-stone-400">Next step</span>}
          </dd>
        </div>
        <div className="flex justify-between border-t border-stone-200 pt-3 text-[17px]">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatZAR(order.totalCents)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[12px] text-stone-400">ZAR, includes 15% VAT.</p>
    </div>
  );
}
