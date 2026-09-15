"use client";

import Image from "next/image";
import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Badge, Breadcrumbs, Notice, Price, StockLabel } from "@/components/ui";
import { QuantityStepper } from "@/components/ui-client";
import type { OptionValue, Product, Variant } from "@/lib/commerce/types";
import { cn } from "@/lib/format";

interface ProductViewProps {
  product: Product;
  details: ReactNode;
  breadcrumbs: Array<{ href?: string; label: string }>;
}

export function ProductView({ product, details, breadcrumbs }: ProductViewProps) {
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();

  const hasColors = product.colors.length > 0;
  const hasSizes = product.sizes.length > 0;
  const singleSize = product.sizes.length === 1;

  const firstAvailableColor =
    product.colors.find((c) => product.variants.some((v) => v.color?.id === c.id && v.stock.purchasable)) ??
    product.colors[0] ??
    null;

  const [color, setColor] = useState<OptionValue | null>(firstAvailableColor);
  const [size, setSize] = useState<OptionValue | null>(singleSize ? product.sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const variantFor = (c: OptionValue | null, s: OptionValue | null): Variant | undefined =>
    product.variants.find(
      (v) => (!hasColors || v.color?.id === c?.id) && (!hasSizes || v.size?.id === s?.id),
    );

  const selectedVariant = useMemo(
    () => variantFor(color, size),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color, size, product.variants],
  );

  const sizeAvailability = (s: OptionValue) => variantFor(color, s)?.stock ?? null;
  const colorAvailable = (c: OptionValue) => product.variants.some((v) => v.color?.id === c.id && v.stock.purchasable);

  // Clamp the quantity to the selected variant's stock when the option changes
  // (handled in the selection handlers rather than an effect).
  const clampToVariant = (c: OptionValue | null, s: OptionValue | null, next: number) => {
    const variant = variantFor(c, s);
    if (!variant) return next;
    const max = variant.stock.backorderable ? 10 : variant.stock.countOnHand;
    return max > 0 ? Math.min(next, max) : next;
  };

  const selectColor = (c: OptionValue) => {
    setColor(c);
    setQuantity((q) => clampToVariant(c, size, q));
  };

  const selectSize = (s: OptionValue) => {
    setSize(s);
    setQuantity((q) => clampToVariant(color, s, q));
  };

  const images = useMemo(() => {
    const colourImages = color ? product.images.filter((img) => img.optionValueId === color.id) : [];
    const generic = product.images.filter((img) => img.optionValueId == null);
    return colourImages.length ? [...colourImages, ...generic] : product.images;
  }, [product.images, color]);

  const needsSize = hasSizes && !size;
  const canAdd = Boolean(selectedVariant?.stock.purchasable) && !needsSize;
  const maxQty = selectedVariant?.stock.backorderable ? 10 : (selectedVariant?.stock.countOnHand ?? 1);

  const handleAdd = () => {
    if (!selectedVariant) return;
    setError(null);
    startTransition(async () => {
      const result = await addItem(selectedVariant.id, quantity);
      if (!result.ok) {
        setError(result.error);
      } else {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2200);
      }
    });
  };

  const price = selectedVariant?.priceCents ?? product.priceCents;

  return (
    <div className="container-x fade-in pt-4 sm:pt-8">
      <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14 xl:gap-20">
        {/* Gallery */}
        <Gallery images={images} name={product.name} />

        {/* Purchase panel */}
        <div className="pt-6 lg:pt-0">
          <div className="lg:sticky lg:top-36">
            <Breadcrumbs items={breadcrumbs} />

            <div className="mt-5 flex items-start justify-between gap-6">
              <div>
                <h1 className="display text-[34px] leading-[1.02] sm:text-[42px]">{product.name}</h1>
                {product.categoryName && <p className="mt-1.5 text-[13px] text-stone-500">{product.categoryName}</p>}
              </div>
              <Price cents={price} compareAtCents={product.compareAtPriceCents} size="lg" className="shrink-0 pt-2" />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.newArrival && <Badge tone="dark">New</Badge>}
              {product.bestseller && <Badge tone="outline">Bestseller</Badge>}
              {!product.purchasable && <Badge tone="neutral">Sold out</Badge>}
            </div>

            <p className="mt-6 text-[15px] leading-relaxed text-stone-600">{product.description}</p>

            {/* Colour */}
            {hasColors && (
              <div className="mt-8">
                <div className="flex items-baseline justify-between">
                  <p className="label text-stone-500">Colour</p>
                  <p className="text-[13px]">{color?.presentation}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {product.colors.map((c) => {
                    const active = c.id === color?.id;
                    const available = colorAvailable(c);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        title={available ? c.presentation : `${c.presentation} — sold out`}
                        aria-label={available ? c.presentation : `${c.presentation}, sold out`}
                        aria-pressed={active}
                        onClick={() => selectColor(c)}
                        className={cn(
                          "relative flex size-11 items-center justify-center rounded-full border transition-shadow",
                          active ? "border-ink ring-1 ring-ink ring-offset-2 ring-offset-bone" : "border-black/10 hover:ring-1 hover:ring-stone-300 hover:ring-offset-2 hover:ring-offset-bone",
                        )}
                      >
                        <span className="size-8 rounded-full border border-black/10" style={{ backgroundColor: c.hex ?? "#ccc" }} />
                        {!available && <span className="absolute h-px w-9 rotate-45 bg-ink/70" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            {hasSizes && (
              <div className="mt-7">
                <div className="flex items-baseline justify-between">
                  <p className="label text-stone-500">Size</p>
                  <a href="/help#sizing" className="label link-underline text-stone-500">
                    Size guide
                  </a>
                </div>
                <div className={cn("mt-3 grid gap-2", product.sizes.length > 6 ? "grid-cols-4" : "grid-cols-5")}>
                  {product.sizes.map((s) => {
                    const stock = sizeAvailability(s);
                    const available = Boolean(stock?.purchasable);
                    const active = s.id === size?.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!available}
                        aria-pressed={active}
                        aria-label={available ? `Size ${s.presentation}` : `Size ${s.presentation}, sold out`}
                        onClick={() => selectSize(s)}
                        className={cn(
                          "relative flex h-12 items-center justify-center overflow-hidden border text-[13px] transition-colors",
                          active
                            ? "border-ink bg-ink text-bone"
                            : available
                              ? "border-stone-200 bg-white hover:border-ink"
                              : "cursor-not-allowed border-stone-200 bg-bone text-stone-400",
                        )}
                      >
                        {s.presentation}
                        {!available && (
                          <span className="absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-[24deg] bg-stone-300" aria-hidden />
                        )}
                        {available && stock && stock.level === "very_low" && !active && (
                          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-amber" aria-hidden />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 min-h-5">
                  {selectedVariant ? (
                    <StockLabel stock={selectedVariant.stock} />
                  ) : needsSize ? (
                    <p className="text-[13px] text-stone-500">
                      {product.sizes.some((s) => !sizeAvailability(s)?.purchasable)
                        ? "Select a size — crossed-out sizes are sold out in this colour."
                        : "Select a size."}
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {!hasSizes && selectedVariant && (
              <div className="mt-6">
                <StockLabel stock={selectedVariant.stock} />
              </div>
            )}

            {/* Quantity + add */}
            <div className="mt-6 flex gap-3">
              <QuantityStepper value={quantity} min={1} max={Math.max(1, maxQty)} onChange={setQuantity} disabled={!canAdd} />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!canAdd || isPending}
                className={cn("btn-primary flex-1", justAdded && "bg-success hover:bg-success")}
              >
                {isPending ? (
                  "Adding…"
                ) : justAdded ? (
                  <>
                    <Check className="size-4" /> Added to bag
                  </>
                ) : !product.purchasable ? (
                  "Sold out"
                ) : needsSize ? (
                  "Select a size"
                ) : selectedVariant && !selectedVariant.stock.purchasable ? (
                  "Out of stock"
                ) : (
                  <>
                    <ShoppingBag className="size-4" /> Add to bag
                  </>
                )}
              </button>
            </div>

            {error && (
              <Notice tone="error" className="mt-4">
                {error}
              </Notice>
            )}

            <ul className="mt-6 space-y-1.5 text-[13px] text-stone-500">
              <li>Free standard delivery on orders over R 1,500 · 2–4 working days</li>
              <li>Free exchanges and 30-day returns</li>
              {selectedVariant && <li className="text-stone-400">SKU {selectedVariant.sku}</li>}
            </ul>

            <div className="mt-8">{details}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Gallery({ images, name }: { images: Product["images"]; name: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (images.length === 0) {
    return <div className="bg-bone-deep" style={{ aspectRatio: "4 / 5" }} />;
  }

  return (
    <div>
      {/* Mobile: swipeable */}
      <div className="relative -mx-4 sm:-mx-6 lg:hidden">
        <div ref={scroller} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
          {images.map((img, i) => (
            <div key={img.id} className="relative w-full shrink-0 snap-center bg-bone-deep" style={{ aspectRatio: "4 / 5" }}>
              <Image src={img.url} alt={img.alt || name} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((img, i) => (
              <span key={img.id} className={cn("h-1 w-5 transition-colors", i === index ? "bg-ink" : "bg-ink/25")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: stacked editorial column */}
      <div className={cn("hidden gap-3 lg:grid", images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
        {images.map((img, i) => (
          <div
            key={img.id}
            className={cn("relative overflow-hidden bg-bone-deep", images.length > 1 && i === 0 && "col-span-2")}
            style={{ aspectRatio: images.length > 1 && i === 0 ? "4 / 5" : "4 / 5" }}
          >
            <Image
              src={img.url}
              alt={img.alt || name}
              fill
              priority={i === 0}
              sizes={i === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 29vw, 100vw"}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
