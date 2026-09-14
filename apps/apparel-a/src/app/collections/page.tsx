import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui";
import { commerce } from "@/lib/commerce";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsIndexPage() {
  const [collections, categories] = await Promise.all([
    commerce.listTaxons("collection"),
    commerce.listTaxons("category"),
  ]);

  return (
    <div className="container-x fade-in pt-8 sm:pt-12">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Collections" }]} />
      <h1 className="display mt-6 text-[40px] sm:text-[56px]">Collections</h1>
      <p className="mt-3 max-w-xl text-[15px] text-stone-600">Curated edits for the season, and every category in the range.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/collections/${c.permalink}`}
            className="group relative overflow-hidden bg-bone-deep text-bone"
            style={{ aspectRatio: "16 / 10" }}
          >
            {c.imageUrl && (
              <Image
                src={c.imageUrl}
                alt={c.name}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out-quart group-hover:scale-[1.03]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="display text-[30px] sm:text-[36px]">{c.name}</p>
              <p className="mt-1 line-clamp-2 max-w-md text-[13px] text-bone/80">{c.description}</p>
              <span className="label mt-3 inline-flex items-center gap-2">
                {c.productCount} pieces <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="display mt-20 text-[32px] sm:text-[40px]">Categories</h2>
      <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/collections/${c.permalink}`} className="group block">
              <div className="relative overflow-hidden bg-bone-deep" style={{ aspectRatio: "4 / 5" }}>
                {c.imageUrl && (
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out-quart group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <p className="mt-3 text-[15px] font-medium">{c.name}</p>
              <p className="text-[12px] text-stone-400">{c.productCount} pieces</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
