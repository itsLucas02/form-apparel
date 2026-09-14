import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { FilterPanel, FilterToolbar } from "@/components/catalog/filters";
import { ProductGrid } from "@/components/product/product-card";
import { Breadcrumbs, EmptyState } from "@/components/ui";
import { commerce, type ProductQuery, type SortOption, type Taxon } from "@/lib/commerce";
import { cn } from "@/lib/format";

export type SearchParams = Record<string, string | string[] | undefined>;

const SORTS: SortOption[] = ["featured", "newest", "price-asc", "price-desc", "name-asc", "name-desc"];

function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function int(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function parseProductQuery(sp: SearchParams, taxon?: string): ProductQuery {
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  return {
    q: (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() || undefined,
    taxon,
    categories: list(sp.category),
    sizes: list(sp.size),
    colors: list(sp.color),
    minPriceCents: int(sp.min),
    maxPriceCents: int(sp.max),
    inStockOnly: sp.stock === "in",
    sort: SORTS.includes(sortRaw as SortOption) ? (sortRaw as SortOption) : "featured",
    page: int(sp.page) ?? 1,
  };
}

function pageHref(sp: SearchParams, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page" || value == null) continue;
    for (const v of list(value)) params.append(key, v);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

export async function ProductListing({
  searchParams,
  taxon,
  title,
  eyebrow,
  description,
  hero,
  breadcrumbs,
}: {
  searchParams: SearchParams;
  taxon?: Taxon | null;
  title: ReactNode;
  eyebrow?: string;
  description?: string | null;
  hero?: string | null;
  breadcrumbs: Array<{ href?: string; label: string }>;
}) {
  const query = parseProductQuery(searchParams, taxon?.permalink);
  const result = await commerce.listProducts(query);
  const showCategories = !taxon || taxon.kind === "collection";

  return (
    <div className="fade-in">
      {hero ? (
        <section className="relative isolate h-[42svh] min-h-[300px] w-full overflow-hidden bg-ink text-bone sm:h-[48svh]">
          <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
          <div className="container-x relative flex h-full flex-col justify-end pb-8 sm:pb-12">
            <div className="text-bone/80">
              <Breadcrumbs items={breadcrumbs} />
            </div>
            {eyebrow && <p className="label mt-5 text-bone/70">{eyebrow}</p>}
            <h1 className="display mt-2 text-[44px] sm:text-[64px]">{title}</h1>
            {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-bone/85">{description}</p>}
          </div>
        </section>
      ) : (
        <section className="container-x pt-8 sm:pt-12">
          <Breadcrumbs items={breadcrumbs} />
          {eyebrow && <p className="label mt-6 text-stone-500">{eyebrow}</p>}
          <h1 className="display mt-2 text-[40px] sm:text-[56px]">{title}</h1>
          {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-stone-600">{description}</p>}
        </section>
      )}

      <section className={cn("container-x", hero ? "pt-8 sm:pt-10" : "pt-8 sm:pt-10")}>
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pr-4 pb-10">
              <Suspense>
                <FilterPanel facets={result.facets} showCategories={showCategories} />
              </Suspense>
            </div>
          </aside>

          <div>
            <Suspense>
              <FilterToolbar facets={result.facets} showCategories={showCategories} totalCount={result.totalCount} />
            </Suspense>

            <div className="pt-8">
              {result.products.length === 0 ? (
                <EmptyState
                  title="Nothing matches those filters"
                  description="Try removing a filter or two, or browse the full range."
                  action={{ href: taxon ? `/collections/${taxon.permalink}` : "/products", label: "Clear filters" }}
                />
              ) : (
                <ProductGrid products={result.products} />
              )}
            </div>

            {result.totalPages > 1 && (
              <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
                {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageHref(searchParams, p)}
                    aria-current={p === result.page ? "page" : undefined}
                    className={cn(
                      "flex size-10 items-center justify-center border text-[13px]",
                      p === result.page ? "border-ink bg-ink text-bone" : "border-stone-200 hover:border-ink",
                    )}
                  >
                    {p}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
