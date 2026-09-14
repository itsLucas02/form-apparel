"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { CartLine, useCart } from "@/components/cart/cart-provider";
import { Breadcrumbs, EmptyState, Notice } from "@/components/ui";
import { brand } from "@/lib/brand";
import { formatZAR } from "@/lib/format";

export function CartPageView() {
  const { cart, error } = useCart();
  const items = cart?.lineItems ?? [];
  const subtotal = cart?.itemTotalCents ?? 0;
  const remaining = brand.freeDeliveryThresholdCents - subtotal;
  const progress = Math.min(100, Math.round((subtotal / brand.freeDeliveryThresholdCents) * 100));

  return (
    <div className="container-x fade-in pt-8 sm:pt-12">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Bag" }]} />
      <div className="mt-6 flex items-end justify-between">
        <h1 className="display text-[40px] sm:text-[56px]">
          Bag{" "}
          {items.length > 0 && <span className="text-stone-400">({cart?.itemCount})</span>}
        </h1>
        {items.length > 0 && (
          <Link href="/products" className="label link-underline hidden pb-2 sm:inline-block">
            Continue shopping
          </Link>
        )}
      </div>

      {error && (
        <Notice tone="error" className="mt-6">
          {error}
        </Notice>
      )}

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your bag is empty"
            description="Start with the essentials, or see what's new this week."
            action={{ href: "/collections/new-in", label: "Shop new in" }}
          />
        </div>
      ) : (
        <div className="mt-8 lg:grid lg:grid-cols-[1fr_380px] lg:gap-16">
          <ul className="divide-y divide-stone-200 border-y border-stone-200">
            {items.map((item) => (
              <li key={item.id} className="py-6">
                <CartLine item={item} />
              </li>
            ))}
          </ul>

          <aside className="mt-10 lg:mt-0">
            <div className="lg:sticky lg:top-36">
              <div className="border border-stone-200 bg-white p-6">
                <h2 className="text-[15px] font-medium">Summary</h2>

                <div className="mt-5">
                  <div className="h-1 w-full bg-bone-deep">
                    <div className="h-1 bg-ink transition-[width] duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-[13px] text-stone-500">
                    {remaining > 0 ? (
                      <>
                        <span className="text-ink">{formatZAR(remaining)}</span> away from free standard delivery
                      </>
                    ) : (
                      <span className="text-success">Free standard delivery unlocked</span>
                    )}
                  </p>
                </div>

                <dl className="mt-6 space-y-3 text-[14px]">
                  <div className="flex justify-between">
                    <dt className="text-stone-500">Subtotal</dt>
                    <dd className="tabular-nums">{formatZAR(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-500">Delivery</dt>
                    <dd className="text-stone-500">{remaining > 0 ? "From R 95" : "Free"}</dd>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-3 text-[16px]">
                    <dt>Estimated total</dt>
                    <dd className="tabular-nums">{formatZAR(subtotal + (remaining > 0 ? 9500 : 0))}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-[12px] text-stone-400">Includes 15% VAT. Final delivery cost confirmed at checkout.</p>

                <Link href="/checkout" className="btn-primary mt-6 w-full">
                  Checkout <ArrowRight className="size-4" />
                </Link>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-stone-400">
                  <Lock className="size-3" /> Secure checkout · Card or Instant EFT
                </p>
              </div>
              <Link href="/products" className="label link-underline mt-6 inline-block sm:hidden">
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
