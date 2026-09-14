"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  addToCartAction,
  getCartAction,
  removeLineItemAction,
  updateLineItemAction,
  type CartActionResult,
} from "@/app/actions/cart";
import type { Cart, LineItem } from "@/lib/commerce/types";
import { brand } from "@/lib/brand";
import { cn, formatZAR, variantLabel } from "@/lib/format";
import { QuantityStepper } from "@/components/ui-client";
import { Price } from "@/components/ui";

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (variantId: number, quantity: number) => Promise<CartActionResult>;
  updateItem: (lineItemId: number, quantity: number) => Promise<CartActionResult>;
  removeItem: (lineItemId: number) => Promise<CartActionResult>;
  refresh: () => Promise<void>;
  busyItemIds: Set<number>;
  error: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ initialCart, children }: { initialCart: Cart | null; children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [isOpen, setOpen] = useState(false);
  const [busyItemIds, setBusy] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setCart(initialCart), [initialCart]);

  const apply = useCallback((result: CartActionResult) => {
    if (result.ok) {
      setCart(result.cart);
      setError(null);
    } else {
      if (result.cart) setCart(result.cart);
      setError(result.error);
    }
    return result;
  }, []);

  const withBusy = useCallback(
    async (id: number, fn: () => Promise<CartActionResult>) => {
      setBusy((prev) => new Set(prev).add(id));
      try {
        return apply(await fn());
      } finally {
        setBusy((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [apply],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: cart?.itemCount ?? 0,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      addItem: async (variantId, quantity) => {
        const result = apply(await addToCartAction(variantId, quantity));
        if (result.ok) setOpen(true);
        return result;
      },
      updateItem: (lineItemId, quantity) => withBusy(lineItemId, () => updateLineItemAction(lineItemId, quantity)),
      removeItem: (lineItemId) => withBusy(lineItemId, () => removeLineItemAction(lineItemId)),
      refresh: async () => {
        setCart(await getCartAction());
      },
      busyItemIds,
      error,
    }),
    [cart, isOpen, busyItemIds, error, apply, withBusy],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */

function CartDrawer() {
  const { cart, isOpen, close, error } = useCart();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when navigating away.
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const items = cart?.lineItems ?? [];
  const subtotal = cart?.itemTotalCents ?? 0;
  const remaining = brand.freeDeliveryThresholdCents - subtotal;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button
        type="button"
        aria-label="Close bag"
        className="absolute inset-0 bg-ink/40 fade-in"
        onClick={close}
      />
      <div
        ref={panelRef}
        className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-bone shadow-2xl slide-in-right"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 sm:px-6">
          <h2 className="text-[15px] font-medium">
            Bag <span className="text-stone-400">({cart?.itemCount ?? 0})</span>
          </h2>
          <button type="button" onClick={close} className="-mr-2 p-2" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        {error && <p className="border-b border-clay/30 bg-clay-soft/50 px-6 py-2 text-[13px] text-clay">{error}</p>}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="display text-[28px]">Your bag is empty</p>
            <p className="mt-2 text-[14px] text-stone-500">Add something you&apos;ll wear for years.</p>
            <Link href="/products" onClick={close} className="btn-primary mt-8">
              Shop new in
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-stone-200 overflow-y-auto px-5 sm:px-6">
              {items.map((item) => (
                <li key={item.id} className="py-5">
                  <CartLine item={item} compact />
                </li>
              ))}
            </ul>
            <div className="border-t border-stone-200 bg-bone px-5 py-5 sm:px-6">
              <p className="mb-4 text-[13px] text-stone-500">
                {remaining > 0 ? (
                  <>
                    Add <span className="text-ink">{formatZAR(remaining)}</span> more for free delivery.
                  </>
                ) : (
                  <span className="text-success">You qualify for free standard delivery.</span>
                )}
              </p>
              <div className="flex items-center justify-between text-[15px]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatZAR(subtotal)}</span>
              </div>
              <p className="mt-1 text-[12px] text-stone-400">Delivery calculated at checkout. VAT included.</p>
              <Link href="/checkout" onClick={close} className="btn-primary mt-5 w-full">
                Checkout <ArrowRight className="size-4" />
              </Link>
              <Link href="/cart" onClick={close} className="label link-underline mt-4 block text-center">
                View bag
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Line item (shared by drawer and cart page)                          */
/* ------------------------------------------------------------------ */

export function CartLine({ item, compact = false }: { item: LineItem; compact?: boolean }) {
  const { updateItem, removeItem, busyItemIds } = useCart();
  const [, startTransition] = useTransition();
  const busy = busyItemIds.has(item.id);
  const max = item.variant.stock.backorderable ? undefined : Math.max(item.variant.stock.countOnHand, item.quantity);

  return (
    <div className={cn("flex gap-4", busy && "opacity-60")}>
      <Link
        href={`/products/${item.product.slug}`}
        className={cn("relative shrink-0 overflow-hidden bg-bone-deep", compact ? "w-[84px]" : "w-[110px] sm:w-[140px]")}
        style={{ aspectRatio: "4 / 5" }}
      >
        {item.variant.imageUrl && (
          <Image src={item.variant.imageUrl} alt={item.product.name} fill sizes="140px" className="object-cover" />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/products/${item.product.slug}`} className="block truncate text-[14px] font-medium">
              {item.product.name}
            </Link>
            <p className="mt-0.5 text-[13px] text-stone-500">{variantLabel(item.variant.color, item.variant.size)}</p>
            {item.variant.stock.level !== "in_stock" && item.variant.stock.message && (
              <p className="mt-1 text-[12px] text-amber">{item.variant.stock.message}</p>
            )}
          </div>
          <Price cents={item.totalCents} size={compact ? "sm" : "md"} className="shrink-0" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={max}
            disabled={busy}
            onChange={(qty) => startTransition(() => void updateItem(item.id, qty))}
          />
          <button
            type="button"
            className="label text-stone-500 transition-colors hover:text-ink"
            disabled={busy}
            onClick={() => startTransition(() => void removeItem(item.id))}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
