"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/format";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="lg:sticky lg:top-36 lg:self-start">
      <ul className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-stone-200 px-4 lg:mx-0 lg:flex-col lg:gap-0 lg:border-b-0 lg:border-l lg:px-0">
        {LINKS.map((l) => {
          const active = l.href === "/account" ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                className={cn(
                  "block whitespace-nowrap border-b-2 px-3 py-3 text-[14px] transition-colors lg:-ml-px lg:border-b-0 lg:border-l-2 lg:px-5 lg:py-2.5",
                  active ? "border-ink text-ink" : "border-transparent text-stone-500 hover:text-ink",
                )}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 lg:mt-6">
          <form action={logoutAction}>
            <button type="submit" className="block whitespace-nowrap px-3 py-3 text-[14px] text-stone-500 hover:text-ink lg:px-5 lg:py-2.5">
              Sign out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
