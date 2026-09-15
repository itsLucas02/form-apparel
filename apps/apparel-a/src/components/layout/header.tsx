"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { brand } from "@/lib/brand";
import { cn, formatZAR } from "@/lib/format";
import type { Taxon } from "@/lib/commerce/types";

interface HeaderProps {
  categories: Taxon[];
  collections: Taxon[];
  user: { firstName: string } | null;
}

export function Header({ categories, collections, user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close overlays when the route changes (derived during render, not in an effect).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setSearchOpen(false);
  };

  const navItems = [{ name: "New In", permalink: "new-in" }, ...categories.map((c) => ({ name: c.name, permalink: c.permalink }))];

  return (
    <>
      <div className="bg-ink text-bone">
        <p className="container-x flex h-9 items-center justify-center text-center text-[11px] font-medium uppercase tracking-label">
          <span className="hidden sm:inline">Free delivery on orders over {formatZAR(brand.freeDeliveryThresholdCents)}</span>
          <span className="mx-3 hidden text-stone-400 sm:inline">·</span>
          <span>{brand.returnsWindowDays}-day returns, nationwide</span>
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-stone-200 bg-bone/95 backdrop-blur supports-[backdrop-filter]:bg-bone/85">
        <div className="container-x">
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-[72px]">
            {/* Left */}
            <div className="flex items-center gap-1 lg:gap-2">
              <button
                type="button"
                className="-ml-2 p-2 lg:hidden"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-5" />
              </button>
              <button
                type="button"
                className="p-2 lg:hidden"
                aria-label="Search"
                onClick={() => setSearchOpen((v) => !v)}
              >
                <Search className="size-5" />
              </button>
              <form onSubmit={submitSearch} className="hidden lg:block" role="search">
                <label className="group flex h-10 w-64 items-center gap-2 border-b border-stone-200 transition-colors focus-within:border-ink">
                  <Search className="size-4 text-stone-400 group-focus-within:text-ink" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search shirts, knitwear, denim…"
                    className="h-full w-full bg-transparent text-[14px] placeholder:text-stone-400 focus:outline-none"
                    aria-label="Search products"
                  />
                </label>
              </form>
            </div>

            {/* Wordmark – placeholder brand */}
            <Link href="/" className="px-4 text-[24px] font-semibold tracking-[0.32em] lg:text-[26px]" aria-label={`${brand.name} home`}>
              {brand.name}
            </Link>

            {/* Right */}
            <div className="flex items-center justify-end gap-1 lg:gap-6">
              <Link href="/account" className="hidden items-center gap-2 text-[12px] font-medium uppercase tracking-label lg:inline-flex link-underline">
                {user ? `Hi, ${user.firstName}` : "Account"}
              </Link>
              <Link href="/account" className="p-2 lg:hidden" aria-label="Account">
                <User className="size-5" />
              </Link>
              <button
                type="button"
                onClick={open}
                className="-mr-2 flex items-center gap-2 p-2 lg:mr-0 lg:p-0"
                aria-label={`Open bag, ${itemCount} items`}
              >
                <span className="hidden text-[12px] font-medium uppercase tracking-label lg:inline">Bag</span>
                <span className="relative inline-flex">
                  <ShoppingBag className="size-5 lg:hidden" />
                  <span
                    className={cn(
                      "absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-ink text-[10px] font-medium leading-none text-bone lg:static lg:size-auto lg:rounded-none lg:bg-transparent lg:text-[12px] lg:text-ink",
                      itemCount === 0 && "lg:inline hidden",
                    )}
                  >
                    <span className="lg:hidden">{itemCount}</span>
                    <span className="hidden lg:inline">({itemCount})</span>
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Category navigation (desktop) */}
          <nav className="hidden lg:block" aria-label="Categories">
            <div className="no-scrollbar overflow-x-auto">
              <ul className="mx-auto flex w-max items-center gap-7 pb-3.5">
                {navItems.map((item) => {
                  const href = `/collections/${item.permalink}`;
                  const active = pathname === href;
                  return (
                    <li key={item.permalink}>
                      <Link
                        href={href}
                        className={cn(
                          "label link-underline whitespace-nowrap py-1 transition-colors",
                          active ? "text-ink" : "text-stone-500 hover:text-ink",
                          item.permalink === "new-in" && "text-clay hover:text-clay",
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link href="/products" className="label link-underline whitespace-nowrap py-1 text-stone-500 hover:text-ink">
                    Shop all
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <form onSubmit={submitSearch} className="border-t border-stone-200 bg-bone px-4 py-3 lg:hidden fade-in" role="search">
            <label className="flex h-11 items-center gap-3 border border-stone-200 bg-white px-3">
              <Search className="size-4 text-stone-400" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="h-full w-full bg-transparent text-[15px] focus:outline-none"
                aria-label="Search products"
              />
              <button type="submit" className="label">
                Go
              </button>
            </label>
          </form>
        )}
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/40 fade-in" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[380px] flex-col bg-bone slide-in-left">
            <div className="flex h-16 items-center justify-between border-b border-stone-200 px-5">
              <span className="text-[18px] font-semibold tracking-[0.32em]">{brand.name}</span>
              <button type="button" className="-mr-2 p-2" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="space-y-1">
                <li>
                  <Link href="/collections/new-in" className="display block py-2 text-[34px] text-clay">
                    New In
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/collections/${c.permalink}`} className="display block py-2 text-[34px]">
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/products" className="display block py-2 text-[34px]">
                    Shop All
                  </Link>
                </li>
              </ul>
              <p className="label mt-10 mb-3 text-stone-400">Collections</p>
              <ul className="space-y-3">
                {collections
                  .filter((c) => c.permalink !== "new-in")
                  .map((c) => (
                    <li key={c.id}>
                      <Link href={`/collections/${c.permalink}`} className="text-[15px]">
                        {c.name}
                      </Link>
                    </li>
                  ))}
              </ul>
              <p className="label mt-10 mb-3 text-stone-400">Account</p>
              <ul className="space-y-3 text-[15px]">
                <li>
                  <Link href="/account">{user ? `Hi, ${user.firstName} — my account` : "Sign in / create account"}</Link>
                </li>
                <li>
                  <Link href="/account/orders">Order history</Link>
                </li>
                <li>
                  <Link href="/help">Delivery &amp; returns</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
