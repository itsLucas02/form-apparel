import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing, type SearchParams } from "@/components/catalog/listing";
import { commerce } from "@/lib/commerce";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const taxon = await commerce.getTaxon(slug);
  return { title: taxon?.name ?? "Collection", description: taxon?.description ?? undefined };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const taxon = await commerce.getTaxon(slug);
  if (!taxon) notFound();

  const isCollection = taxon.kind === "collection";
  return (
    <ProductListing
      searchParams={sp}
      taxon={taxon}
      eyebrow={isCollection ? "Collection" : "Category"}
      title={taxon.name}
      description={taxon.description}
      hero={isCollection ? taxon.imageUrl : null}
      breadcrumbs={[
        { href: "/", label: "Home" },
        { href: isCollection ? "/collections" : "/products", label: isCollection ? "Collections" : "Shop" },
        { label: taxon.name },
      ]}
    />
  );
}
