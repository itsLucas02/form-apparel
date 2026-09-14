import { cache } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import type {
  FacetOption,
  OptionType,
  OptionTypeName,
  OptionValue,
  Product,
  ProductFacets,
  ProductImage,
  ProductListResult,
  ProductQuery,
  ProductSummary,
  SortOption,
  Taxon,
  Variant,
} from "../types";
import { mapOptionValue, stockInfo } from "./shared";

interface CatalogSnapshot {
  products: Product[];
  productsById: Map<number, Product>;
  productsBySlug: Map<string, Product>;
  taxons: Taxon[];
  taxonsByPermalink: Map<string, Taxon>;
}

/**
 * The catalogue is small (tens of products) so we hydrate it in a handful of
 * queries and filter/sort in memory. A Spree adapter would instead translate
 * ProductQuery into `filter[...]`/`sort` params on /api/v2/storefront/products.
 * `cache` dedupes the load within a single request.
 */
export const loadCatalog = cache(async (): Promise<CatalogSnapshot> => {
  const [
    taxonRows,
    optionTypeRows,
    optionValueRows,
    productRows,
    productTaxonRows,
    productOptionTypeRows,
    variantRows,
    ovvRows,
    stockRows,
    imageRows,
  ] = await Promise.all([
    db.select().from(s.taxons).orderBy(asc(s.taxons.position), asc(s.taxons.name)),
    db.select().from(s.optionTypes).orderBy(asc(s.optionTypes.position)),
    db.select().from(s.optionValues).orderBy(asc(s.optionValues.position)),
    db.select().from(s.products),
    db.select().from(s.productsTaxons).orderBy(asc(s.productsTaxons.position)),
    db.select().from(s.productOptionTypes).orderBy(asc(s.productOptionTypes.position)),
    db.select().from(s.variants).orderBy(asc(s.variants.position), asc(s.variants.id)),
    db.select().from(s.optionValueVariants),
    db.select().from(s.stockItems),
    db.select().from(s.images).orderBy(asc(s.images.position), asc(s.images.id)),
  ]);

  const optionTypeById = new Map(optionTypeRows.map((r) => [r.id, r]));
  const optionValueById = new Map<number, OptionValue>();
  for (const ov of optionValueRows) {
    const ot = optionTypeById.get(ov.optionTypeId);
    if (!ot) continue;
    optionValueById.set(ov.id, mapOptionValue(ov, ot.name as OptionTypeName));
  }

  const taxonById = new Map<number, Taxon>();
  const taxons: Taxon[] = taxonRows.map((t) => {
    const taxon: Taxon = {
      id: t.id,
      name: t.name,
      permalink: t.permalink,
      kind: t.kind === "collection" ? "collection" : "category",
      description: t.description,
      imageUrl: t.imageUrl,
      position: t.position,
      productCount: 0,
    };
    taxonById.set(t.id, taxon);
    return taxon;
  });

  const taxonsByProduct = new Map<number, Taxon[]>();
  for (const pt of productTaxonRows) {
    const taxon = taxonById.get(pt.taxonId);
    if (!taxon) continue;
    const list = taxonsByProduct.get(pt.productId) ?? [];
    list.push(taxon);
    taxonsByProduct.set(pt.productId, list);
    taxon.productCount = (taxon.productCount ?? 0) + 1;
  }

  const optionTypesByProduct = new Map<number, number[]>();
  for (const pot of productOptionTypeRows) {
    const list = optionTypesByProduct.get(pot.productId) ?? [];
    list.push(pot.optionTypeId);
    optionTypesByProduct.set(pot.productId, list);
  }

  const optionValuesByVariant = new Map<number, OptionValue[]>();
  for (const ovv of ovvRows) {
    const ov = optionValueById.get(ovv.optionValueId);
    if (!ov) continue;
    const list = optionValuesByVariant.get(ovv.variantId) ?? [];
    list.push(ov);
    optionValuesByVariant.set(ovv.variantId, list);
  }

  const stockByVariant = new Map(stockRows.map((r) => [r.variantId, r]));

  const variantsByProduct = new Map<number, Variant[]>();
  const productPriceById = new Map(productRows.map((p) => [p.id, p]));
  for (const v of variantRows) {
    if (v.isMaster) continue;
    const product = productPriceById.get(v.productId);
    if (!product) continue;
    const optionValues = (optionValuesByVariant.get(v.id) ?? []).sort((a, b) => a.position - b.position);
    const stock = stockByVariant.get(v.id);
    const variant: Variant = {
      id: v.id,
      sku: v.sku,
      priceCents: v.priceCents ?? product.priceCents,
      compareAtPriceCents: product.compareAtPriceCents,
      isMaster: false,
      position: v.position,
      optionValues,
      color: optionValues.find((o) => o.optionType === "color") ?? null,
      size: optionValues.find((o) => o.optionType === "size") ?? null,
      stock: stockInfo(stock?.countOnHand ?? 0, stock?.backorderable ?? false),
    };
    const list = variantsByProduct.get(v.productId) ?? [];
    list.push(variant);
    variantsByProduct.set(v.productId, list);
  }

  const imagesByProduct = new Map<number, ProductImage[]>();
  for (const img of imageRows) {
    const list = imagesByProduct.get(img.productId) ?? [];
    list.push({ id: img.id, url: img.url, alt: img.alt, position: img.position, optionValueId: img.optionValueId });
    imagesByProduct.set(img.productId, list);
  }

  const products: Product[] = productRows.map((p) => {
    const variants = variantsByProduct.get(p.id) ?? [];
    const images = imagesByProduct.get(p.id) ?? [];
    const productTaxons = taxonsByProduct.get(p.id) ?? [];
    const colors = uniqueOptionValues(variants.map((v) => v.color));
    const sizes = uniqueOptionValues(variants.map((v) => v.size));
    const optionTypes: OptionType[] = (optionTypesByProduct.get(p.id) ?? [])
      .map((otId) => optionTypeById.get(otId))
      .filter((ot): ot is NonNullable<typeof ot> => Boolean(ot))
      .map((ot) => ({
        id: ot.id,
        name: ot.name as OptionTypeName,
        presentation: ot.presentation,
        position: ot.position,
        values: ot.name === "color" ? colors : sizes,
      }));
    const purchasable = variants.some((v) => v.stock.purchasable);
    const totalOnHand = variants.reduce((sum, v) => sum + Math.max(v.stock.countOnHand, 0), 0);
    const category = productTaxons.find((t) => t.kind === "category") ?? null;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      priceCents: p.priceCents,
      compareAtPriceCents: p.compareAtPriceCents,
      thumbnailUrl: images[0]?.url ?? null,
      hoverImageUrl: images[1]?.url ?? null,
      colors,
      sizes,
      purchasable,
      lowStock: purchasable && totalOnHand <= 10,
      newArrival: p.newArrival,
      bestseller: p.bestseller,
      featured: p.featured,
      categoryName: category?.name ?? null,
      details: p.details ?? {},
      images,
      optionTypes,
      variants,
      taxons: productTaxons,
      availableOn: p.availableOn.toISOString(),
    };
  });

  return {
    products,
    productsById: new Map(products.map((p) => [p.id, p])),
    productsBySlug: new Map(products.map((p) => [p.slug, p])),
    taxons,
    taxonsByPermalink: new Map(taxons.map((t) => [t.permalink, t])),
  };
});

function uniqueOptionValues(values: Array<OptionValue | null>): OptionValue[] {
  const seen = new Map<number, OptionValue>();
  for (const v of values) if (v && !seen.has(v.id)) seen.set(v.id, v);
  return [...seen.values()].sort((a, b) => a.position - b.position);
}

export function toSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceCents: p.priceCents,
    compareAtPriceCents: p.compareAtPriceCents,
    thumbnailUrl: p.thumbnailUrl,
    hoverImageUrl: p.hoverImageUrl,
    colors: p.colors,
    purchasable: p.purchasable,
    lowStock: p.lowStock,
    newArrival: p.newArrival,
    bestseller: p.bestseller,
    categoryName: p.categoryName,
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function listTaxons(kind?: "category" | "collection"): Promise<Taxon[]> {
  const { taxons } = await loadCatalog();
  return kind ? taxons.filter((t) => t.kind === kind) : taxons;
}

export async function getTaxon(permalink: string): Promise<Taxon | null> {
  const { taxonsByPermalink } = await loadCatalog();
  return taxonsByPermalink.get(permalink) ?? null;
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { productsBySlug } = await loadCatalog();
  return productsBySlug.get(slug) ?? null;
}

export async function getProductById(id: number): Promise<Product | null> {
  const { productsById } = await loadCatalog();
  return productsById.get(id) ?? null;
}

export async function getRelatedProducts(productId: number, limit = 4): Promise<ProductSummary[]> {
  const { products, productsById } = await loadCatalog();
  const product = productsById.get(productId);
  if (!product) return [];
  const categoryIds = new Set(product.taxons.filter((t) => t.kind === "category").map((t) => t.id));
  const sameCategory = products.filter(
    (p) => p.id !== productId && p.taxons.some((t) => categoryIds.has(t.id)),
  );
  const others = products.filter((p) => p.id !== productId && !sameCategory.includes(p));
  const ranked = [...sameCategory, ...others].sort((a, b) => Number(b.purchasable) - Number(a.purchasable));
  return ranked.slice(0, limit).map(toSummary);
}

export async function getFeaturedProducts(
  kind: "new" | "bestsellers" | "featured",
  limit = 8,
): Promise<ProductSummary[]> {
  const { products } = await loadCatalog();
  const picked = products.filter((p) =>
    kind === "new" ? p.newArrival : kind === "bestsellers" ? p.bestseller : p.featured,
  );
  const sorted = kind === "new" ? sortProducts(picked, "newest") : picked;
  return sorted.slice(0, limit).map(toSummary);
}

const PER_PAGE = 24;

export async function listProducts(query: ProductQuery): Promise<ProductListResult> {
  const { products, taxonsByPermalink } = await loadCatalog();

  // Base scope: taxon + search. Facets are computed from this scope so the
  // customer can always see which sizes/colours/categories are available.
  let scope = products;
  if (query.taxon) {
    const taxon = taxonsByPermalink.get(query.taxon);
    scope = taxon ? scope.filter((p) => p.taxons.some((t) => t.id === taxon.id)) : [];
  }
  if (query.q && query.q.trim()) {
    const tokens = query.q.toLowerCase().split(/\s+/).filter(Boolean);
    scope = scope.filter((p) => {
      const haystack = [
        p.name,
        p.description,
        p.categoryName ?? "",
        ...p.taxons.map((t) => t.name),
        ...p.colors.map((c) => c.presentation),
        ...Object.values(p.details ?? {}),
      ]
        .join(" ")
        .toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }

  const facets = buildFacets(scope);

  let filtered = scope;
  if (query.categories?.length) {
    const wanted = new Set(query.categories);
    filtered = filtered.filter((p) => p.taxons.some((t) => wanted.has(t.permalink)));
  }
  if (query.sizes?.length) {
    const wanted = new Set(query.sizes);
    filtered = filtered.filter((p) =>
      p.variants.some((v) => v.size && wanted.has(v.size.name) && v.stock.purchasable),
    );
  }
  if (query.colors?.length) {
    const wanted = new Set(query.colors);
    filtered = filtered.filter((p) => p.colors.some((c) => wanted.has(c.name)));
  }
  if (query.minPriceCents != null) filtered = filtered.filter((p) => p.priceCents >= query.minPriceCents!);
  if (query.maxPriceCents != null) filtered = filtered.filter((p) => p.priceCents <= query.maxPriceCents!);
  if (query.inStockOnly) filtered = filtered.filter((p) => p.purchasable);

  const sorted = sortProducts(filtered, query.sort ?? "featured");
  const perPage = query.perPage ?? PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const page = Math.min(Math.max(query.page ?? 1, 1), totalPages);
  const start = (page - 1) * perPage;

  return {
    products: sorted.slice(start, start + perPage).map(toSummary),
    totalCount: sorted.length,
    page,
    perPage,
    totalPages,
    facets,
  };
}

function sortProducts(list: Product[], sort: SortOption): Product[] {
  const copy = [...list];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => b.availableOn.localeCompare(a.availableOn) || a.id - b.id);
    case "price-asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents || a.name.localeCompare(b.name));
    case "price-desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents || a.name.localeCompare(b.name));
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case "featured":
    default:
      return copy.sort(
        (a, b) =>
          Number(b.purchasable) - Number(a.purchasable) ||
          Number(b.bestseller) - Number(a.bestseller) ||
          Number(b.newArrival) - Number(a.newArrival) ||
          b.availableOn.localeCompare(a.availableOn) ||
          a.id - b.id,
      );
  }
}

function buildFacets(scope: Product[]): ProductFacets {
  const categories = new Map<string, FacetOption>();
  const sizes = new Map<string, FacetOption & { position: number }>();
  const colors = new Map<string, FacetOption & { position: number }>();
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const p of scope) {
    min = Math.min(min, p.priceCents);
    max = Math.max(max, p.priceCents);
    for (const t of p.taxons) {
      if (t.kind !== "category") continue;
      const f = categories.get(t.permalink) ?? { value: t.permalink, label: t.name, count: 0 };
      f.count += 1;
      categories.set(t.permalink, f);
    }
    for (const size of p.sizes) {
      const f = sizes.get(size.name) ?? { value: size.name, label: size.presentation, count: 0, position: size.position };
      f.count += 1;
      sizes.set(size.name, f);
    }
    for (const color of p.colors) {
      const f = colors.get(color.name) ?? {
        value: color.name,
        label: color.presentation,
        count: 0,
        hex: color.hex,
        position: color.position,
      };
      f.count += 1;
      colors.set(color.name, f);
    }
  }

  return {
    categories: [...categories.values()].sort((a, b) => a.label.localeCompare(b.label)),
    sizes: [...sizes.values()].sort((a, b) => a.position - b.position),
    colors: [...colors.values()].sort((a, b) => a.position - b.position),
    priceMinCents: Number.isFinite(min) ? min : 0,
    priceMaxCents: max,
  };
}
