import type { Metadata } from "next";
import Link from "next/link";
import { deleteAddressAction, setDefaultAddressAction } from "@/app/account/actions";
import { AddressForm } from "@/components/account/address-form";
import { Badge } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/session";
import { commerce } from "@/lib/commerce";
import { formatAddressLines } from "@/lib/za";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string }> }) {
  const [sp, user] = await Promise.all([searchParams, getCurrentUser()]);
  const addresses = await commerce.listAddresses(user!.id);
  const editing = sp.edit ? (addresses.find((a) => a.id === Number(sp.edit)) ?? null) : null;
  const showForm = Boolean(editing) || sp.new === "1";

  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[17px] font-medium">Addresses</h2>
          <p className="mt-1 text-[14px] text-stone-500">Saved delivery addresses for faster checkout.</p>
        </div>
        {!showForm && (
          <Link href="/account/addresses?new=1" className="btn-secondary h-10 px-4">
            Add address
          </Link>
        )}
      </div>

      {showForm && (
        <div className="mt-6">
          <AddressForm address={editing} />
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <p className="mt-6 text-[14px] text-stone-500">No saved addresses yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="flex flex-col border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-medium">{a.label ?? "Address"}</p>
                {a.isDefault && <Badge tone="neutral">Default</Badge>}
              </div>
              <address className="mt-3 flex-1 text-[14px] not-italic leading-relaxed text-stone-600">
                {formatAddressLines(a).map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
                <span className="mt-1 block text-stone-400">{a.phone}</span>
              </address>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium uppercase tracking-label">
                <Link href={`/account/addresses?edit=${a.id}`} className="link-underline">
                  Edit
                </Link>
                {!a.isDefault && (
                  <form action={setDefaultAddressAction}>
                    <input type="hidden" name="addressId" value={a.id} />
                    <button type="submit" className="link-underline uppercase tracking-label">
                      Set as default
                    </button>
                  </form>
                )}
                <form action={deleteAddressAction}>
                  <input type="hidden" name="addressId" value={a.id} />
                  <button type="submit" className="link-underline uppercase tracking-label text-stone-500 hover:text-clay">
                    Remove
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
