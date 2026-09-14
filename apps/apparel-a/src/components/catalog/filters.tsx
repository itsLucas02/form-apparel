"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { ProductFacets, SortOption } from "@/lib/commerce/types";
import { cn, formatZAR } from "@/lib/format";

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A–Z" },
];

export const PRICE_BANDS: Array<{ id: string; label: string; min?: number; max?: number }> = [
  { id: "under-750", label: "Under R 750", max: 74_999 },
  { id: "750-1500", label: "R 750 – R 1,500", min: 75_000, max: 150_000 },
  { id: "1500-3000", label: "R 1,500 – R 3,000", min: 150_000, max: 300_000 },
  { id: "over-3000", label: "Over R 3,000", min: 300_000 },
];

function useCatalogUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      next.delete("page");
      const qs = next.toString();
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [params, pathname, router],
  );

  const toggleMulti = useCallback(
    (key: string, value: string) =>
      update((next) => {
        const values = next.getAll(key);
        next.delete(key);
        const set = new Set(values);
        if (set.has(value)) set.delete(value);
        else set.add(value);
        for (const v of set) next.append(key, v);
      }),
    [update],
  );

  return { params, update, toggleMulti, isPending };
}

interface FilterProps {
  facets: ProductFacets;
  showCategories: boolean;
}

export function FilterPanel({ facets, showCategories }: FilterProps) {
  const { params, update, toggleMulti } = useCatalogUrl();
  const selectedCategories = params.getAll("category");
  const selectedSizes = params.getAll("size");
  const selectedColors = params.getAll("color");
  const min = params.get("min");
  const max = params.get("max");
  const inStock = params.get("stock") === "in";
  const activeBand = PRICE_BANDS.find(
    (b) => String(b.min ?? "") === (min ?? "") && String(b.max ?? "") === (max ?? ""),
  )?.id;

  return (
    <div className="space-y-8">
      {showCategories && facets.categories.length > 1 && (
        <FilterGroup title="Category">
          <ul className="space-y-2.5">
            {facets.categories.map((c) => {
              const checked = selectedCategories.includes(c.value);
              return (
                <li key={c.value}>
                  <button
                    type="button"
                    onClick={() => toggleMulti("category", c.value)}
                    className="flex w-full items-center justify-between gap-3 text-left text-[14px]"
                    aria-pressed={checked}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center border transition-colors",
                          checked ? "border-ink bg-ink text-bone" : "border-stone-300 bg-white",
                        )}
                      >
                        {checked && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      {c.label}
                    </span>
                    <span className="text-[12px] text-stone-400">{c.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      )}

      {facets.sizes.length > 0 && (
        <FilterGroup title="Size">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((sz) => {
              const active = selectedSizes.includes(sz.value);
              return (
                <button
                  key={sz.value}
                  type="button"
                  onClick={() => toggleMulti("size", sz.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex h-10 min-w-11 items-center justify-center border px-3 text-[13px] transition-colors",
                    active ? "border-ink bg-ink text-bone" : "border-stone-200 bg-white hover:border-ink",
                  )}
                >
                  {sz.label}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {facets.colors.length > 0 && (
        <FilterGroup title="Colour">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {facets.colors.map((c) => {
              const active = selectedColors.includes(c.value);
              return (
                <li key={c.value}>
                  <button
                    type="button"
                    onClick={() => toggleMulti("color", c.value)}
                    aria-pressed={active}
                    className="flex items-center gap-2.5 text-left text-[13px]"
                  >
                    <span
                      className={cn(
                        "relative size-5 rounded-full border border-black/10 transition-shadow",
                        active && "ring-1 ring-ink ring-offset-2 ring-offset-bone",
                      )}
                      style={{ backgroundColor: c.hex ?? "#ccc" }}
                    />
                    <span className={cn(active ? "text-ink" : "text-stone-600")}>{c.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        <ul className="space-y-2.5">
          {PRICE_BANDS.map((band) => {
            const active = activeBand === band.id;
            return (
              <li key={band.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    update((next) => {
                      next.delete("min");
                      next.delete("max");
                      if (!active) {
                        if (band.min != null) next.set("min", String(band.min));
                        if (band.max != null) next.set("max", String(band.max));
                      }
                    })
                  }
                  className="flex items-center gap-3 text-[14px]"
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full border transition-colors",
                      active ? "border-ink" : "border-stone-300",
                    )}
                  >
                    {active && <span className="size-2 rounded-full bg-ink" />}
                  </span>
                  {band.label}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[12px] text-stone-400">
          Range {formatZAR(facets.priceMinCents)} – {formatZAR(facets.priceMaxCents)}
        </p>
      </FilterGroup>

      <FilterGroup title="Availability">
        <button
          type="button"
          role="switch"
          aria-checked={inStock}
          onClick={() =>
            update((next) => {
              if (inStock) next.delete("stock");
              else next.set("stock", "in");
            })
          }
          className="flex items-center gap-3 text-[14px]"
        >
          <span className={cn("relative h-5 w-9 rounded-full transition-colors", inStock ? "bg-ink" : "bg-stone-300")}>
            <span
              className={cn(
                "absolute top-0.5 size-4 rounded-full bg-white transition-transform",
                inStock ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </span>
          In stock only
        </button>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-4 text-stone-500">{title}</p>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar: result count, sort, active chips, mobile drawer            */
/* ------------------------------------------------------------------ */

export function FilterToolbar({
  facets,
  showCategories,
  totalCount,
}: FilterProps & { totalCount: number }) {
  const { params, update, toggleMulti, isPending } = useCatalogUrl();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sort = (params.get("sort") as SortOption | null) ?? "featured";

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const chips = useMemo(() => {
    const list: Array<{ key: string; label: string; onRemove: () => void }> = [];
    for (const v of params.getAll("category")) {
      const f = facets.categories.find((c) => c.value === v);
      list.push({ key: `category-${v}`, label: f?.label ?? v, onRemove: () => toggleMulti("category", v) });
    }
    for (const v of params.getAll("size")) {
      const f = facets.sizes.find((c) => c.value === v);
      list.push({ key: `size-${v}`, label: `Size ${f?.label ?? v}`, onRemove: () => toggleMulti("size", v) });
    }
    for (const v of params.getAll("color")) {
      const f = facets.colors.find((c) => c.value === v);
      list.push({ key: `color-${v}`, label: f?.label ?? v, onRemove: () => toggleMulti("color", v) });
    }
    const min = params.get("min");
    const max = params.get("max");
    if (min || max) {
      const band = PRICE_BANDS.find((b) => String(b.min ?? "") === (min ?? "") && String(b.max ?? "") === (max ?? ""));
      list.push({
        key: "price",
        label: band?.label ?? "Price",
        onRemove: () =>
          update((next) => {
            next.delete("min");
            next.delete("max");
          }),
      });
    }
    if (params.get("stock") === "in") {
      list.push({ key: "stock", label: "In stock", onRemove: () => update((next) => next.delete("stock")) });
    }
    if (params.get("q")) {
      list.push({ key: "q", label: `“${params.get("q")}”`, onRemove: () => update((next) => next.delete("q")) });
    }
    return list;
  }, [params, facets, toggleMulti, update]);

  const clearAll = () =>
    update((next) => {
      for (const key of ["category", "size", "color", "min", "max", "stock", "q"]) next.delete(key);
    });

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setDrawerOpen(true)} className="btn-ghost h-10 gap-2 px-4 lg:hidden">
            <SlidersHorizontal className="size-4" /> Filter
            {chips.length > 0 && <span className="ml-1 text-stone-400">({chips.length})</span>}
          </button>
          <p className={cn("text-[13px] text-stone-500 transition-opacity", isPending && "opacity-50")} aria-live="polite">
            {totalCount} {totalCount === 1 ? "product" : "products"}
          </p>
        </div>
        <label className="relative flex items-center gap-2 text-[13px]">
          <span className="hidden text-stone-500 sm:inline">Sort</span>
          <select
            value={sort}
            onChange={(e) => update((next) => next.set("sort", e.target.value))}
            className="h-10 appearance-none border border-stone-200 bg-white pl-3 pr-9 text-[13px] focus:border-ink focus:outline-none"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 size-4 text-stone-400" />
        </label>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex h-8 items-center gap-1.5 border border-stone-200 bg-white px-3 text-[12px] hover:border-ink"
            >
              {chip.label}
              <X className="size-3" />
            </button>
          ))}
          <button type="button" onClick={clearAll} className="label ml-1 text-stone-500 hover:text-ink">
            Clear all
          </button>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-ink/40 fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-[400px] flex-col bg-bone slide-in-right">
            <div className="flex h-16 items-center justify-between border-b border-stone-200 px-5">
              <span className="text-[15px] font-medium">Filter</span>
              <button type="button" className="-mr-2 p-2" aria-label="Close" onClick={() => setDrawerOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <FilterPanel facets={facets} showCategories={showCategories} />
            </div>
            <div className="flex gap-3 border-t border-stone-200 p-5">
              <button type="button" onClick={clearAll} className="btn-ghost flex-1">
                Clear
              </button>
              <button type="button" onClick={() => setDrawerOpen(false)} className="btn-primary flex-1">
                Show {totalCount}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
