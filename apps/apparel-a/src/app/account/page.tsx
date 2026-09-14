import type { Metadata } from "next";
import Link from "next/link";
import { OrderRow } from "@/components/account/order-row";
import { EmptyState } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/session";
import { commerce } from "@/lib/commerce";
import { formatAddressLines } from "@/lib/za";

export const metadata: Metadata = { title: "Account" };

export default async function AccountOverviewPage() {
  const user = (await getCurrentUser())!;
  const [orders, addresses] = await Promise.all([commerce.listOrders(user.id), commerce.listAddresses(user.id)]);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const recent = orders.slice(0, 3);

  return (
    <div className="space-y-14">
      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-[17px] font-medium">Recent orders</h2>
          {orders.length > 3 && (
            <Link href="/account/orders" className="label link-underline text-stone-500">
              All orders ({orders.length})
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No orders yet" description="When you place an order it will appear here with live tracking." action={{ href: "/products", label: "Start shopping" }} />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
            {recent.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-10 sm:grid-cols-2">
        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-[17px] font-medium">Default address</h2>
            <Link href="/account/addresses" className="label link-underline text-stone-500">
              Manage
            </Link>
          </div>
          {defaultAddress ? (
            <address className="mt-4 text-[14px] not-italic leading-relaxed text-stone-600">
              {defaultAddress.label && <span className="block font-medium text-ink">{defaultAddress.label}</span>}
              {formatAddressLines(defaultAddress).map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
          ) : (
            <p className="mt-4 text-[14px] text-stone-500">No saved addresses yet.</p>
          )}
        </section>
        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-[17px] font-medium">Profile</h2>
            <Link href="/account/profile" className="label link-underline text-stone-500">
              Edit
            </Link>
          </div>
          <dl className="mt-4 space-y-1.5 text-[14px] text-stone-600">
            <div>
              <dt className="sr-only">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt className="sr-only">Phone</dt>
              <dd>{user.phone ?? "No phone number"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
