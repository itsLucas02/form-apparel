import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGrid, ProductRail } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui";
import { brand } from "@/lib/brand";
import { commerce } from "@/lib/commerce";
import { formatZAR } from "@/lib/format";

export default async function HomePage() {
  const [newIn, bestsellers, categories] = await Promise.all([
    commerce.getFeaturedProducts("new", 8),
    commerce.getFeaturedProducts("bestsellers", 8),
    commerce.listTaxons("category"),
  ]);
  const featuredCategories = ["shirts", "knitwear", "trousers", "outerwear", "jeans", "accessories"]
    .map((slug) => categories.find((c) => c.permalink === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="relative isolate h-[calc(100svh-var(--header-h))] min-h-[560px] w-full overflow-hidden bg-ink text-bone">
        <Image
          src="/images/hero-aw26.webp"
          alt="Man in a camel overcoat on a Cape Town street at golden hour"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-ink/10 sm:bg-gradient-to-r sm:from-ink/60 sm:via-ink/20 sm:to-transparent" />
        <div className="container-x relative flex h-full flex-col justify-end pb-12 sm:justify-center sm:pb-0">
          <p className="label mb-5 text-bone/80 slide-up">Autumn / Winter 26</p>
          <h1 className="display max-w-[12ch] text-[52px] sm:text-[76px] lg:text-[96px] slide-up" style={{ animationDelay: "60ms" }}>
            Dressed for the <em className="italic">long</em> season.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-bone/85 slide-up" style={{ animationDelay: "120ms" }}>
            Tailoring, knitwear and outerwear built for South African days that start cold and end warm. Cut properly,
            made to last, delivered nationwide.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 slide-up" style={{ animationDelay: "180ms" }}>
            <Link href="/collections/winter-layers" className="btn-light">
              Shop the edit
            </Link>
            <Link href="/collections/new-in" className="btn border border-bone/70 text-bone hover:bg-bone hover:text-ink">
              New arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Category discovery */}
      <section className="container-x pt-14 sm:pt-20">
        <SectionHeading eyebrow="Shop by category" title="Start with the basics" action={{ href: "/products", label: "Shop all" }} />
        <div className="no-scrollbar -mx-4 mt-8 flex snap-x gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-4 lg:px-0">
          {featuredCategories.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.permalink}`}
              className="group relative w-[44vw] shrink-0 snap-start overflow-hidden bg-bone-deep sm:w-[30vw] lg:w-auto"
              style={{ aspectRatio: "3 / 4" }}
            >
              {c.imageUrl && (
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 16vw, 44vw"
                  className="object-cover transition-transform duration-700 ease-out-quart group-hover:scale-[1.04]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
              <span className="absolute bottom-4 left-4 flex items-center gap-2 text-[15px] font-medium text-bone">
                {c.name}
                <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="container-x pt-20 sm:pt-28">
        <SectionHeading eyebrow="Just landed" title="New this week" action={{ href: "/collections/new-in", label: "View all new in" }} />
        <div className="mt-8">
          <ProductRail products={newIn} />
        </div>
        <Link href="/collections/new-in" className="label link-underline mt-6 inline-block sm:hidden">
          View all new in
        </Link>
      </section>

      {/* Editorial: Linen */}
      <section className="container-x pt-20 sm:pt-28">
        <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-16">
          <div className="relative overflow-hidden bg-bone-deep" style={{ aspectRatio: "4 / 5" }}>
            <Image
              src="/images/edit-linen.webp"
              alt="Man in a sand linen shirt against a whitewashed Karoo wall"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="md:pr-10">
            <p className="label text-stone-500">The Linen Edit</p>
            <h2 className="display mt-4 text-[40px] sm:text-[56px]">
              Built for <em className="italic">Highveld</em> afternoons.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-stone-600">
              Belgian linen, garment-washed for softness from the first wear. Camp collars, drawstring trousers and
              shorts cut to move — the pieces that make 34°C feel reasonable.
            </p>
            <Link href="/collections/the-linen-edit" className="btn-primary mt-8">
              Shop the linen edit
            </Link>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="container-x pt-20 sm:pt-28">
        <SectionHeading eyebrow="Most wanted" title="Bestsellers" action={{ href: "/products?sort=featured", label: "Shop all" }} />
        <div className="mt-8">
          <ProductGrid products={bestsellers} priorityCount={0} />
        </div>
      </section>

      {/* Editorial: Knitwear (reversed) */}
      <section className="mt-20 bg-ink text-bone sm:mt-28">
        <div className="container-x grid items-center gap-10 py-16 md:grid-cols-2 md:py-24 lg:gap-16">
          <div className="order-2 md:order-1 md:pl-6">
            <p className="label text-bone/60">Winter Layers</p>
            <h2 className="display mt-4 text-[40px] sm:text-[56px]">
              Knitwear, <em className="italic">properly</em> made.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-bone/75">
              Extra-fine merino from 12-gauge machines, chunky lambswool cables finished by hand. Warm at 6am on the
              N1, comfortable by lunch.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collections/winter-layers" className="btn-light">
                Shop winter layers
              </Link>
              <Link href="/collections/knitwear" className="btn border border-bone/60 text-bone hover:bg-bone hover:text-ink">
                All knitwear
              </Link>
            </div>
          </div>
          <div className="relative order-1 overflow-hidden md:order-2" style={{ aspectRatio: "4 / 5" }}>
            <Image
              src="/images/edit-knitwear.webp"
              alt="Folded merino and cable knits on an oak table"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Service strip */}
      <section className="container-x grid gap-8 border-b border-stone-200 py-14 sm:grid-cols-3 sm:gap-6">
        {[
          {
            title: "Nationwide delivery",
            body: `Door-to-door courier in 2–4 working days. Free on orders over ${formatZAR(brand.freeDeliveryThresholdCents)}.`,
          },
          {
            title: `${brand.returnsWindowDays}-day returns`,
            body: "Wrong size? Exchange or return within 30 days — we'll arrange the collection.",
          },
          {
            title: "Secure checkout",
            body: "Card and Instant EFT, 3D Secure protected. Prices include VAT.",
          },
        ].map((item) => (
          <div key={item.title}>
            <h3 className="text-[15px] font-medium">{item.title}</h3>
            <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-stone-500">{item.body}</p>
          </div>
        ))}
      </section>

      {/* Tailoring editorial banner */}
      <section className="container-x pt-14 sm:pt-20">
        <Link href="/collections/wardrobe-essentials" className="group relative block overflow-hidden bg-bone-deep" style={{ aspectRatio: "16 / 9" }}>
          <Image
            src="/images/edit-tailoring.webp"
            alt="Two men walking through Maboneng in late afternoon light"
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-[1200ms] ease-out-quart group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3 text-bone sm:bottom-10 sm:left-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label text-bone/70">Wardrobe Essentials</p>
              <p className="display mt-2 text-[34px] sm:text-[48px]">The pieces everything else is built around.</p>
            </div>
            <span className="label inline-flex items-center gap-2">
              Shop essentials <ArrowRight className="size-4" />
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}
