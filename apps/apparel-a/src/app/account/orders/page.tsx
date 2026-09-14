import type { Metadata } from "next";
import { OrderRow } from "@/components/account/order-row";
import { EmptyState } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/session";
import { commerce } from "@/lib/commerce";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const user = (await getCurrentUser())!;
  const orders = await commerce.listOrders(user.id);
  return (
    <section>
      <h2 className="text-[17px] font-medium">Order history</h2>
      <p className="mt-1 text-[14px] text-stone-500">{orders.length} orders</p>
      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No orders yet" description="When you place an order it will appear here with live tracking." action={{ href: "/products", label: "Start shopping" }} />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </ul>
      )}
    </section>
  );
}
