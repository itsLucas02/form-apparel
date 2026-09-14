import Image from "next/image";
import Link from "next/link";
import { Badge, Price } from "@/components/ui";
import type { ProductSummary } from "@/lib/commerce/types";
import { cn } from "@/lib/format";

export function ProductCard({
  product,
  priority = false,
  className,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
}: {
  product: ProductSummary;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const href = `/products/${product.slug}`;
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link href={href} className="relative block overflow-hidden bg-bone-deep" style={{ aspectRatio: "4 / 5" }}>
        {product.thumbnailUrl ? (
          <>
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              sizes={sizes}
              priority={priority}
              className={cn(
                "object-cover transition-transform duration-700 ease-out-quart group-hover:scale-[1.03]",
                product.hoverImageUrl && "group-hover:opacity-0",
                !product.purchasable && "opacity-70",
              )}
            />
            {product.hoverImageUrl && (
              <Image
                src={product.hoverImageUrl}
                alt=""
                fill
                sizes={sizes}
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : null}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {!product.purchasable ? (
            <Badge tone="neutral">Sold out</Badge>
          ) : (
            <>
              {product.newArrival && <Badge tone="dark">New</Badge>}
              {product.lowStock && <Badge tone="amber">Low stock</Badge>}
            </>
          )}
        </div>
      </Link>
      <div className="flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-medium leading-snug">
            <Link href={href} className="after:absolute after:inset-0">
              {product.name}
            </Link>
          </h3>
          {product.categoryName && <p className="mt-0.5 text-[12px] text-stone-400">{product.categoryName}</p>}
        </div>
        <Price cents={product.priceCents} compareAtCents={product.compareAtPriceCents} size="sm" className="shrink-0 pt-px" />
      </div>
      {product.colors.length > 1 && (
        <div className="mt-2 flex items-center gap-1.5" aria-label={`${product.colors.length} colours`}>
          {product.colors.slice(0, 6).map((c) => (
            <span
              key={c.id}
              className="size-2.5 rounded-full border border-black/10"
              style={{ backgroundColor: c.hex ?? "#ccc" }}
              title={c.presentation}
            />
          ))}
          {product.colors.length > 6 && <span className="text-[11px] text-stone-400">+{product.colors.length - 6}</span>}
        </div>
      )}
    </article>
  );
}

export function ProductGrid({
  products,
  columns = 4,
  priorityCount = 4,
}: {
  products: ProductSummary[];
  columns?: 3 | 4;
  priorityCount?: number;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6",
        columns === 4 ? "md:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-3",
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

/** Horizontal, snap-scrolling rail on mobile; grid on desktop. */
export function ProductRail({ products }: { products: ProductSummary[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          className="w-[70vw] shrink-0 snap-start sm:w-[42vw] lg:w-auto"
          sizes="(min-width: 1024px) 25vw, 70vw"
        />
      ))}
    </div>
  );
}
