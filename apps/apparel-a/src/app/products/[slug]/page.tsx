import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/product-card";
import { ProductView } from "@/components/product/product-view";
import { DefinitionList, SectionHeading } from "@/components/ui";
import { Accordion } from "@/components/ui-client";
import { brand } from "@/lib/brand";
import { commerce } from "@/lib/commerce";
import { formatZAR } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await commerce.getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — ${formatZAR(product.priceCents)}`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await commerce.getProduct(slug);
  if (!product) notFound();

  const related = await commerce.getRelatedProducts(product.id, 4);
  const category = product.taxons.find((t) => t.kind === "category");
  const details = product.details;

  const accordion = (
    <Accordion
      defaultOpen={null}
      items={[
        {
          id: "details",
          title: "Details & fabric",
          content: (
            <DefinitionList
              items={[
                details.fabric ? { term: "Fabric", value: details.fabric } : null,
                details.fit ? { term: "Fit", value: details.fit } : null,
                details.madeIn ? { term: "Origin", value: details.madeIn } : null,
              ].filter((i): i is { term: string; value: string } => i !== null)}
            />
          ),
        },
        {
          id: "care",
          title: "Care",
          content: <p>{details.care ?? "See the care label inside the garment."}</p>,
        },
        {
          id: "delivery",
          title: "Delivery & returns",
          content: (
            <ul className="space-y-2">
              <li>
                Standard courier (2–4 working days) R 95, free over {formatZAR(brand.freeDeliveryThresholdCents)}. Express
                (1–2 working days) R 195 to major centres.
              </li>
              <li>
                {brand.returnsWindowDays}-day returns and free size exchanges. Unworn, with tags. We arrange the courier
                collection.
              </li>
              <li>Orders placed before 12:00 on a working day are dispatched the same day from Cape Town.</li>
            </ul>
          ),
        },
      ]}
    />
  );

  return (
    <>
      <ProductView
        product={product}
        details={accordion}
        breadcrumbs={[
          { href: "/", label: "Home" },
          category ? { href: `/collections/${category.permalink}`, label: category.name } : { href: "/products", label: "Shop" },
          { label: product.name },
        ]}
      />

      {related.length > 0 && (
        <section className="container-x pt-24">
          <SectionHeading eyebrow="You may also like" title="Complete the look" action={category ? { href: `/collections/${category.permalink}`, label: `All ${category.name.toLowerCase()}` } : undefined} />
          <div className="mt-8">
            <ProductGrid products={related} priorityCount={0} />
          </div>
        </section>
      )}
    </>
  );
}
