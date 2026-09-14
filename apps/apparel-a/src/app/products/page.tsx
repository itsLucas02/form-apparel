import type { Metadata } from "next";
import { ProductListing, type SearchParams } from "@/components/catalog/listing";

export const metadata: Metadata = { title: "All products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  return (
    <ProductListing
      searchParams={sp}
      eyebrow={q ? "Search results" : "All products"}
      title={q ? <>Results for &ldquo;{q}&rdquo;</> : "Everything"}
      description={q ? null : "The full FORM range — shirts to outerwear, made to be worn for years."}
      breadcrumbs={[{ href: "/", label: "Home" }, { label: q ? "Search" : "All products" }]}
    />
  );
}
