import Link from "next/link";
import { brand } from "@/lib/brand";
import type { Taxon } from "@/lib/commerce/types";

export function Footer({ categories }: { categories: Taxon[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-stone-200 bg-bone">
      <div className="container-x grid gap-12 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="text-[22px] font-semibold tracking-[0.32em]">{brand.name}</p>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-stone-500">
            {brand.tagline} Designed in Cape Town, delivered nationwide. Prices in South African Rand, VAT included.
          </p>
          <p className="mt-6 text-[13px] text-stone-500">
            {brand.address}
            <br />
            <a href={`mailto:${brand.supportEmail}`} className="link-underline">
              {brand.supportEmail}
            </a>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-8 md:pl-10">
          <div>
            <p className="label mb-4 text-stone-400">Shop</p>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/collections/new-in" className="link-underline">
                  New In
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/collections/${c.permalink}`} className="link-underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-4 text-stone-400">Help</p>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/help#delivery" className="link-underline">
                  Delivery
                </Link>
              </li>
              <li>
                <Link href="/help#returns" className="link-underline">
                  Returns &amp; exchanges
                </Link>
              </li>
              <li>
                <Link href="/help#sizing" className="link-underline">
                  Size guide
                </Link>
              </li>
              <li>
                <Link href="/help#payment" className="link-underline">
                  Payment
                </Link>
              </li>
              <li>
                <Link href="/help#contact" className="link-underline">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="label mb-4 text-stone-400">Account</p>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/account" className="link-underline">
                  My account
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="link-underline">
                  Order history
                </Link>
              </li>
              <li>
                <Link href="/account/addresses" className="link-underline">
                  Addresses
                </Link>
              </li>
              <li>
                <Link href="/cart" className="link-underline">
                  Bag
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-stone-200">
        <div className="container-x flex flex-col gap-3 py-5 text-[12px] text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.legalName}. All prices in ZAR.
          </p>
          <p className="label">Visa · Mastercard · Amex · Instant EFT</p>
        </div>
      </div>
    </footer>
  );
}
