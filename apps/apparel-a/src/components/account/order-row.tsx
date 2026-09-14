import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusPill } from "@/components/ui";
import type { OrderSummary } from "@/lib/commerce/types";
import { formatDate, formatZAR, pluralize } from "@/lib/format";

export function OrderRow({ order }: { order: OrderSummary }) {
  return (
    <li>
      <Link href={`/account/orders/${order.number}`} className="group flex items-center gap-4 py-4 sm:gap-6">
        <div className="flex shrink-0 -space-x-3">
          {order.thumbnailUrls.slice(0, 3).map((url, i) => (
            <div key={`${url}-${i}`} className="relative w-12 border-2 border-bone bg-bone-deep sm:w-14" style={{ aspectRatio: "4 / 5" }}>
              <Image src={url} alt="" fill sizes="56px" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-[14px] font-medium">{order.number}</p>
            <StatusPill status={order.shipmentState ?? order.paymentState} />
          </div>
          <p className="mt-1 truncate text-[13px] text-stone-500">
            {formatDate(order.completedAt)} · {pluralize(order.itemCount, "item")}
            {order.firstItemName ? ` · ${order.firstItemName}${order.itemCount > 1 ? " and more" : ""}` : ""}
          </p>
        </div>
        <p className="shrink-0 text-[14px] tabular-nums">{formatZAR(order.totalCents)}</p>
        <ChevronRight className="size-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}
