/**
 * Demo catalogue for the FORM storefront.
 *
 * Isolated here so it can be replaced by Spree's own product data. Imagery is
 * licensed stock photography (Pexels) plus generated campaign imagery.
 */

const px = (id: number) => `/images/catalog/${id}.webp`;

export const COLORS: Array<{ name: string; presentation: string; hex: string }> = [
  { name: "white", presentation: "White", hex: "#F4F2EE" },
  { name: "ecru", presentation: "Ecru", hex: "#EBE3D2" },
  { name: "cream", presentation: "Cream", hex: "#F1EBDD" },
  { name: "natural", presentation: "Natural", hex: "#E6DCC6" },
  { name: "oatmeal", presentation: "Oatmeal", hex: "#D8CDBB" },
  { name: "sand", presentation: "Sand", hex: "#D3BF9C" },
  { name: "stone", presentation: "Stone", hex: "#C3B8A5" },
  { name: "camel", presentation: "Camel", hex: "#B7885A" },
  { name: "tan", presentation: "Tan", hex: "#AE7A47" },
  { name: "tobacco", presentation: "Tobacco", hex: "#8A5A3A" },
  { name: "chocolate", presentation: "Chocolate", hex: "#4A2F24" },
  { name: "rust", presentation: "Rust", hex: "#A4522F" },
  { name: "dusty-rose", presentation: "Dusty Rose", hex: "#C9A39B" },
  { name: "sage", presentation: "Sage", hex: "#A5B09A" },
  { name: "olive", presentation: "Olive", hex: "#5C6142" },
  { name: "khaki", presentation: "Khaki", hex: "#8B8360" },
  { name: "forest", presentation: "Forest", hex: "#2F4A3A" },
  { name: "bottle-green", presentation: "Bottle Green", hex: "#1F4034" },
  { name: "sky", presentation: "Sky", hex: "#CFDFEE" },
  { name: "light-blue", presentation: "Light Blue", hex: "#B7CBE0" },
  { name: "mid-blue", presentation: "Mid Blue", hex: "#4F6D9A" },
  { name: "washed-blue", presentation: "Washed Blue", hex: "#7A93B5" },
  { name: "indigo", presentation: "Indigo", hex: "#2B3A67" },
  { name: "indigo-raw", presentation: "Raw Indigo", hex: "#1E2A4A" },
  { name: "navy", presentation: "Navy", hex: "#1F2A44" },
  { name: "slate", presentation: "Slate", hex: "#5F6B76" },
  { name: "grey-marl", presentation: "Grey Marl", hex: "#9A9A98" },
  { name: "charcoal", presentation: "Charcoal", hex: "#3B3B3B" },
  { name: "charcoal-check", presentation: "Charcoal Check", hex: "#4A4A4A" },
  { name: "washed-black", presentation: "Washed Black", hex: "#2E2E2E" },
  { name: "black", presentation: "Black", hex: "#141414" },
];

export const SIZES: Array<{ name: string; presentation: string }> = [
  { name: "xs", presentation: "XS" },
  { name: "s", presentation: "S" },
  { name: "m", presentation: "M" },
  { name: "l", presentation: "L" },
  { name: "xl", presentation: "XL" },
  { name: "xxl", presentation: "XXL" },
  { name: "w30", presentation: "30" },
  { name: "w32", presentation: "32" },
  { name: "w34", presentation: "34" },
  { name: "w36", presentation: "36" },
  { name: "w38", presentation: "38" },
  { name: "one-size", presentation: "One Size" },
];

const TOPS = ["s", "m", "l", "xl", "xxl"];
const TOPS_SHORT = ["s", "m", "l", "xl"];
const WAIST = ["w30", "w32", "w34", "w36", "w38"];
const WAIST_SHORT = ["w30", "w32", "w34", "w36"];
const ONE = ["one-size"];

export interface TaxonSeed {
  name: string;
  permalink: string;
  kind: "category" | "collection";
  description: string;
  imageUrl: string | null;
  position: number;
}

export const TAXONS: TaxonSeed[] = [
  { name: "Shirts", permalink: "shirts", kind: "category", description: "Oxford, poplin, linen and flannel — shirts cut to sit cleanly whether tucked or open.", imageUrl: px(28710323), position: 1 },
  { name: "T-Shirts", permalink: "t-shirts", kind: "category", description: "Heavyweight and garment-dyed cottons in the colours we actually wear.", imageUrl: px(28446958), position: 2 },
  { name: "Polos", permalink: "polos", kind: "category", description: "Piqué and fine-knit polos with a properly shaped collar.", imageUrl: px(17898554), position: 3 },
  { name: "Trousers", permalink: "trousers", kind: "category", description: "Chinos, pleated wool and relaxed linen for every kind of day.", imageUrl: px(39338777), position: 4 },
  { name: "Jeans", permalink: "jeans", kind: "category", description: "Selvedge and washed denim in two honest fits.", imageUrl: px(28938765), position: 5 },
  { name: "Shorts", permalink: "shorts", kind: "category", description: "Tailored and linen-blend shorts for long South African summers.", imageUrl: px(18075374), position: 6 },
  { name: "Jackets", permalink: "jackets", kind: "category", description: "Overshirts, harringtons and bombers — the layer between seasons.", imageUrl: px(33235658), position: 7 },
  { name: "Knitwear", permalink: "knitwear", kind: "category", description: "Merino, lambswool and cotton knits made to be worn for years.", imageUrl: px(36510876), position: 8 },
  { name: "Outerwear", permalink: "outerwear", kind: "category", description: "Overcoats, topcoats and technical shells for the cold months.", imageUrl: px(34082626), position: 9 },
  { name: "Accessories", permalink: "accessories", kind: "category", description: "Leather goods, beanies and totes to finish the outfit.", imageUrl: px(8346477), position: 10 },

  { name: "New In", permalink: "new-in", kind: "collection", description: "The latest arrivals, added weekly.", imageUrl: "/images/edit-tailoring.webp", position: 1 },
  { name: "The Linen Edit", permalink: "the-linen-edit", kind: "collection", description: "Breathable European linen for Highveld afternoons and Cape summer evenings.", imageUrl: "/images/edit-linen.webp", position: 2 },
  { name: "Winter Layers", permalink: "winter-layers", kind: "collection", description: "Knitwear, wool and outerwear built for mornings that start at 4°C and afternoons that reach 20°C.", imageUrl: "/images/edit-knitwear.webp", position: 3 },
  { name: "Wardrobe Essentials", permalink: "wardrobe-essentials", kind: "collection", description: "The pieces everything else is built around.", imageUrl: px(7643774), position: 4 },
];

export type StockPattern = "healthy" | "mixed" | "scarce";

export interface ProductSeed {
  name: string;
  slug: string;
  code: string;
  category: string;
  collections?: string[];
  priceCents: number;
  compareAtPriceCents?: number;
  description: string;
  details: Record<string, string>;
  colors: string[];
  sizes: string[];
  images: string[];
  stock: StockPattern;
  /** "color/size" → count on hand. */
  stockOverrides?: Record<string, number>;
  newArrival?: boolean;
  bestseller?: boolean;
  featured?: boolean;
  /** Days ago the product became available (drives "newest" sorting). */
  availableDaysAgo: number;
}

const R = (rands: number) => rands * 100;

export const PRODUCTS: ProductSeed[] = [
  /* ---------------------------------------------------------------- Shirts */
  {
    name: "Oxford Button-Down Shirt",
    slug: "oxford-button-down-shirt",
    code: "OXF",
    category: "shirts",
    collections: ["wardrobe-essentials"],
    priceCents: R(1099),
    description:
      "A properly made Oxford in a dense, softly brushed cotton that improves with every wash. The collar is cut with a slightly longer point so it rolls neatly under a knit, and the body is trimmed through the waist without pulling at the chest.",
    details: {
      fabric: "100% long-staple cotton Oxford cloth, 140gsm",
      fit: "Regular fit. Model is 186cm and wears a size M.",
      care: "Machine wash cold, hang to dry. Warm iron.",
      madeIn: "Made in Portugal",
    },
    colors: ["white", "light-blue", "navy", "black"],
    sizes: TOPS,
    images: [px(7276000), px(7276013), px(37741911)],
    stock: "healthy",
    stockOverrides: { "black/l": 5, "black/xl": 2, "white/xl": 0, "navy/xxl": 0, "light-blue/s": 3 },
    bestseller: true,
    featured: true,
    availableDaysAgo: 120,
  },
  {
    name: "Linen Camp Collar Shirt",
    slug: "linen-camp-collar-shirt",
    code: "LCC",
    category: "shirts",
    collections: ["the-linen-edit"],
    priceCents: R(1299),
    description:
      "Cut from a mid-weight Belgian linen that's been garment-washed for softness from the first wear. The open camp collar and straight hem are made to be worn untucked over shorts or a linen trouser on the hottest days.",
    details: {
      fabric: "100% Belgian linen, 180gsm",
      fit: "Relaxed fit with a boxy body and dropped shoulder.",
      care: "Machine wash cold, gentle cycle. Do not tumble dry.",
      madeIn: "Made in Cape Town",
    },
    colors: ["white", "sand", "olive"],
    sizes: TOPS_SHORT,
    images: [px(17805751), px(17806235)],
    stock: "healthy",
    stockOverrides: { "sand/l": 4, "olive/xl": 0 },
    newArrival: true,
    featured: true,
    availableDaysAgo: 6,
  },
  {
    name: "Poplin Dress Shirt",
    slug: "poplin-dress-shirt",
    code: "POP",
    category: "shirts",
    collections: ["wardrobe-essentials"],
    priceCents: R(1199),
    description:
      "A crisp two-ply poplin with a semi-spread collar that works with or without a tie. Mother-of-pearl buttons, a split back yoke and a slightly lengthened tail keep it in place through a full day.",
    details: {
      fabric: "100% two-ply Egyptian cotton poplin",
      fit: "Slim fit. Size up for a classic fit.",
      care: "Machine wash warm. Iron while damp for best results.",
      madeIn: "Made in Portugal",
    },
    colors: ["white", "sky"],
    sizes: TOPS,
    images: [px(28710323), px(28710327)],
    stock: "healthy",
    availableDaysAgo: 200,
  },
  {
    name: "Chambray Work Shirt",
    slug: "chambray-work-shirt",
    code: "CHM",
    category: "shirts",
    priceCents: R(999),
    description:
      "A 5oz cotton chambray with the utility details done properly: twin chest pockets, triple-needle seams and cat's-eye buttons. Wears like a light jacket over a tee and softens quickly.",
    details: {
      fabric: "100% cotton chambray, 5oz",
      fit: "Regular fit.",
      care: "Machine wash cold. Colour will soften with washing.",
      madeIn: "Made in Mauritius",
    },
    colors: ["indigo", "washed-blue"],
    sizes: TOPS_SHORT,
    images: [px(19971478), px(8063387)],
    stock: "mixed",
    availableDaysAgo: 80,
  },
  {
    name: "Brushed Check Flannel Shirt",
    slug: "brushed-check-flannel-shirt",
    code: "FLN",
    category: "shirts",
    collections: ["winter-layers"],
    priceCents: R(1199),
    description:
      "A brushed cotton flannel woven in a subtle tonal check and cut a touch roomier so it layers over a tee or under an overshirt. Chest pocket, rounded hem and a soft, unlined collar.",
    details: {
      fabric: "100% brushed cotton flannel, 210gsm",
      fit: "Relaxed fit.",
      care: "Machine wash cold inside out. Tumble dry low.",
      madeIn: "Made in Portugal",
    },
    colors: ["light-blue", "olive"],
    sizes: TOPS,
    images: [px(18297245), px(9648924)],
    stock: "mixed",
    newArrival: true,
    availableDaysAgo: 12,
  },
  {
    name: "Striped Linen Shirt",
    slug: "striped-linen-shirt",
    code: "SLN",
    category: "shirts",
    collections: ["the-linen-edit"],
    priceCents: R(1199),
    description:
      "A fine yarn-dyed stripe on lightweight linen, with a soft button-down collar that keeps its shape open at the neck. Ideal for a long lunch or the flight home.",
    details: {
      fabric: "100% linen, 150gsm, yarn-dyed stripe",
      fit: "Regular fit.",
      care: "Machine wash cold. Hang to dry.",
      madeIn: "Made in Cape Town",
    },
    colors: ["navy", "sand"],
    sizes: TOPS_SHORT,
    images: [px(26588136), px(5149729)],
    stock: "scarce",
    availableDaysAgo: 30,
  },

  /* ------------------------------------------------------------- T-Shirts */
  {
    name: "Heavyweight Cotton Tee",
    slug: "heavyweight-cotton-tee",
    code: "HWT",
    category: "t-shirts",
    collections: ["wardrobe-essentials"],
    priceCents: R(499),
    description:
      "A 240gsm jersey that holds its shape wash after wash. Ribbed collar with a reinforced neck tape, a slightly wider sleeve and a hem that sits at the hip. This is the tee we'd build a wardrobe on.",
    details: {
      fabric: "100% organic cotton jersey, 240gsm",
      fit: "Regular fit. Pre-shrunk.",
      care: "Machine wash cold. Tumble dry low.",
      madeIn: "Made in Cape Town",
    },
    colors: ["white", "black", "ecru", "olive"],
    sizes: TOPS,
    images: [px(28446958), px(9775825), px(9775824)],
    stock: "healthy",
    stockOverrides: { "black/m": 2, "ecru/xxl": 0, "olive/l": 6 },
    bestseller: true,
    featured: true,
    availableDaysAgo: 300,
  },
  {
    name: "Garment-Dyed Crew Tee",
    slug: "garment-dyed-crew-tee",
    code: "GDT",
    category: "t-shirts",
    priceCents: R(549),
    description:
      "Dyed after sewing for a soft, lived-in colour with subtle variation at the seams. Mid-weight and cut with a slightly boxier body than our heavyweight tee.",
    details: {
      fabric: "100% cotton jersey, 200gsm, garment-dyed",
      fit: "Relaxed fit.",
      care: "Machine wash cold with similar colours.",
      madeIn: "Made in Portugal",
    },
    colors: ["dusty-rose", "sage", "ecru"],
    sizes: TOPS_SHORT,
    images: [px(8727491), px(36700228)],
    stock: "mixed",
    newArrival: true,
    availableDaysAgo: 4,
  },
  {
    name: "Merino Long Sleeve Tee",
    slug: "merino-long-sleeve-tee",
    code: "MLS",
    category: "t-shirts",
    collections: ["winter-layers"],
    priceCents: R(899),
    description:
      "An 18.5-micron merino jersey that regulates temperature on its own — warm on a cold Johannesburg morning, cool by lunchtime. Flatlock seams and a clean crew neck make it a proper base layer or a shirt in its own right.",
    details: {
      fabric: "100% extra-fine merino wool, 18.5 micron",
      fit: "Slim fit.",
      care: "Machine wash cold on wool cycle. Dry flat.",
      madeIn: "Made in Cape Town",
    },
    colors: ["black", "navy", "grey-marl"],
    sizes: TOPS,
    images: [px(9558577)],
    stock: "mixed",
    availableDaysAgo: 45,
  },

  /* ---------------------------------------------------------------- Polos */
  {
    name: "Piqué Cotton Polo",
    slug: "pique-cotton-polo",
    code: "PQP",
    category: "polos",
    collections: ["wardrobe-essentials"],
    priceCents: R(799),
    description:
      "A classic piqué polo with a collar that has enough structure to stand up under a jacket. Two-button placket, ribbed cuffs and a tennis tail. Nothing embroidered on the chest.",
    details: {
      fabric: "100% combed cotton piqué, 220gsm",
      fit: "Regular fit.",
      care: "Machine wash cold. Reshape collar while damp.",
      madeIn: "Made in Mauritius",
    },
    colors: ["white", "navy", "forest", "black"],
    sizes: TOPS,
    images: [px(17898554), px(38346474), px(17898555)],
    stock: "healthy",
    bestseller: true,
    availableDaysAgo: 150,
  },
  {
    name: "Knitted Silk-Cotton Polo",
    slug: "knitted-silk-cotton-polo",
    code: "KSP",
    category: "polos",
    priceCents: R(1499),
    description:
      "Fully fashioned on fine-gauge machines in a silk and cotton blend with a soft sheen. The open collar and short placket give it a relaxed, seventies ease that dresses up easily with a pleated trouser.",
    details: {
      fabric: "70% cotton, 30% silk, 14-gauge knit",
      fit: "Slim fit.",
      care: "Hand wash cold. Dry flat.",
      madeIn: "Made in Italy",
    },
    colors: ["grey-marl", "cream", "chocolate"],
    sizes: TOPS_SHORT,
    images: [px(39317887), px(39317888)],
    stock: "scarce",
    newArrival: true,
    availableDaysAgo: 9,
  },

  /* ------------------------------------------------------------- Trousers */
  {
    name: "Tapered Cotton Chino",
    slug: "tapered-cotton-chino",
    code: "CHN",
    category: "trousers",
    collections: ["wardrobe-essentials"],
    priceCents: R(1199),
    description:
      "A mid-rise chino in a peached cotton twill with a small amount of stretch. Straight through the thigh with a gentle taper below the knee, finished with a clean hem that sits on the shoe.",
    details: {
      fabric: "98% cotton, 2% elastane twill, 260gsm",
      fit: "Tapered fit. 32 inseam, easily altered.",
      care: "Machine wash cold. Tumble dry low.",
      madeIn: "Made in Portugal",
    },
    colors: ["stone", "navy", "olive", "black"],
    sizes: WAIST,
    images: [px(7643774), px(7643772), px(8350481)],
    stock: "healthy",
    stockOverrides: { "stone/w32": 3, "navy/w34": 1, "olive/w30": 0 },
    bestseller: true,
    featured: true,
    availableDaysAgo: 180,
  },
  {
    name: "Pleated Wool Trouser",
    slug: "pleated-wool-trouser",
    code: "PWT",
    category: "trousers",
    collections: ["winter-layers"],
    priceCents: R(1899),
    description:
      "Single forward pleats, side adjusters and a higher rise give this trouser its easy drape. Woven in a lightweight tropical wool that resists creasing and breathes far better than it looks like it should.",
    details: {
      fabric: "100% tropical wool, 240gsm",
      fit: "Relaxed tapered fit. Unfinished hem included; free hemming in store.",
      care: "Dry clean only.",
      madeIn: "Made in Portugal",
    },
    colors: ["charcoal", "camel"],
    sizes: WAIST_SHORT,
    images: [px(31274809), px(39338777)],
    stock: "mixed",
    newArrival: true,
    availableDaysAgo: 7,
  },
  {
    name: "Linen Drawstring Trouser",
    slug: "linen-drawstring-trouser",
    code: "LDT",
    category: "trousers",
    collections: ["the-linen-edit"],
    priceCents: R(1299),
    description:
      "Wide through the leg with an elasticated drawstring waist that still looks intentional under a shirt. Made from a heavier linen that hangs cleanly rather than clinging.",
    details: {
      fabric: "100% linen, 230gsm",
      fit: "Relaxed wide-leg fit.",
      care: "Machine wash cold. Hang to dry.",
      madeIn: "Made in Cape Town",
    },
    colors: ["natural", "black"],
    sizes: TOPS_SHORT,
    images: [px(17806235), px(37741914)],
    stock: "healthy",
    availableDaysAgo: 25,
  },

  /* ---------------------------------------------------------------- Jeans */
  {
    name: "Slim Selvedge Denim",
    slug: "slim-selvedge-denim",
    code: "SSD",
    category: "jeans",
    priceCents: R(1799),
    description:
      "A 13.5oz Japanese selvedge denim, sanforised so it won't shrink further and cut slim without being tight. Copper rivets, a leather patch and a chain-stitched hem. Wear it raw and let it become yours.",
    details: {
      fabric: "100% cotton Japanese selvedge denim, 13.5oz",
      fit: "Slim fit. Mid rise.",
      care: "Wash rarely, cold, inside out. Hang to dry.",
      madeIn: "Made in Portugal",
    },
    colors: ["indigo-raw", "washed-black"],
    sizes: WAIST_SHORT,
    images: [px(28938765), px(30133696)],
    stock: "mixed",
    bestseller: true,
    availableDaysAgo: 90,
  },
  {
    name: "Straight Leg Jean",
    slug: "straight-leg-jean",
    code: "SLJ",
    category: "jeans",
    collections: ["wardrobe-essentials"],
    priceCents: R(1299),
    description:
      "A comfortable 12oz denim with a touch of stretch, washed to a clean mid-blue with no artificial whiskering. Straight from hip to hem — the fit that works with everything.",
    details: {
      fabric: "99% cotton, 1% elastane denim, 12oz",
      fit: "Straight fit. Mid rise.",
      care: "Machine wash cold inside out.",
      madeIn: "Made in Mauritius",
    },
    colors: ["mid-blue", "black"],
    sizes: WAIST,
    images: [px(31988321), px(28938765)],
    stock: "healthy",
    availableDaysAgo: 140,
  },

  /* --------------------------------------------------------------- Shorts */
  {
    name: "Linen Blend Short",
    slug: "linen-blend-short",
    code: "LBS",
    category: "shorts",
    collections: ["the-linen-edit"],
    priceCents: R(899),
    description:
      "A seven-inch short in a linen-cotton blend that holds a crease better than pure linen. Flat front, side-seam pockets and a hook-and-bar closure.",
    details: {
      fabric: "55% linen, 45% cotton",
      fit: "Regular fit. 7-inch inseam.",
      care: "Machine wash cold.",
      madeIn: "Made in Cape Town",
    },
    colors: ["sand", "navy"],
    sizes: TOPS_SHORT,
    images: [px(18075374), px(27721741)],
    stock: "mixed",
    availableDaysAgo: 60,
  },
  {
    name: "Tailored Cotton Short",
    slug: "tailored-cotton-short",
    code: "TCS",
    category: "shorts",
    priceCents: R(949),
    description:
      "Made in the same peached twill as our chino, with a clean tailored front and a slightly longer nine-inch inseam that sits just above the knee.",
    details: {
      fabric: "98% cotton, 2% elastane twill",
      fit: "Regular fit. 9-inch inseam.",
      care: "Machine wash cold. Tumble dry low.",
      madeIn: "Made in Portugal",
    },
    colors: ["stone", "olive", "navy"],
    sizes: TOPS_SHORT,
    images: [px(18178451), px(18178103)],
    stock: "healthy",
    newArrival: true,
    availableDaysAgo: 14,
  },

  /* -------------------------------------------------------------- Jackets */
  {
    name: "Wool Blend Overshirt",
    slug: "wool-blend-overshirt",
    code: "WBO",
    category: "jackets",
    collections: ["winter-layers"],
    priceCents: R(2299),
    description:
      "Somewhere between a shirt and a jacket: a brushed wool blend with corozo buttons, twin chest pockets and a half-lined body so it slides easily over a knit. The piece we reach for from April to September.",
    details: {
      fabric: "70% wool, 25% polyamide, 5% cashmere, 380gsm",
      fit: "Relaxed fit. Designed to layer.",
      care: "Dry clean only.",
      madeIn: "Made in Portugal",
    },
    colors: ["olive", "charcoal-check"],
    sizes: TOPS_SHORT,
    images: [px(10793257), px(18380141)],
    stock: "mixed",
    newArrival: true,
    featured: true,
    availableDaysAgo: 10,
  },
  {
    name: "Cotton Harrington Jacket",
    slug: "cotton-harrington-jacket",
    code: "HAR",
    category: "jackets",
    collections: ["wardrobe-essentials"],
    priceCents: R(2499),
    description:
      "A lightly waxed cotton harrington with a stand collar, ribbed hem and cuffs and our signature tonal check lining. Showerproof enough for a Cape winter drizzle, light enough for a Highveld evening.",
    details: {
      fabric: "100% cotton, dry-wax finish. Cotton check lining.",
      fit: "Regular fit.",
      care: "Sponge clean. Re-wax annually.",
      madeIn: "Made in Portugal",
    },
    colors: ["black", "navy", "khaki"],
    sizes: TOPS,
    images: [px(33235658), px(29493501)],
    stock: "healthy",
    availableDaysAgo: 70,
  },
  {
    name: "Denim Trucker Jacket",
    slug: "denim-trucker-jacket",
    code: "DTJ",
    category: "jackets",
    priceCents: R(1999),
    description:
      "A type-III trucker in the same 12oz denim as our straight leg jean, with a slightly cropped body and shaped sleeves. Pairs with everything except, perhaps, the matching jeans.",
    details: {
      fabric: "100% cotton denim, 12oz",
      fit: "Regular fit, slightly cropped.",
      care: "Machine wash cold inside out.",
      madeIn: "Made in Mauritius",
    },
    colors: ["mid-blue", "washed-black"],
    sizes: TOPS_SHORT,
    images: [px(16639852), px(31988321)],
    stock: "mixed",
    availableDaysAgo: 55,
  },
  {
    name: "Suede Bomber Jacket",
    slug: "suede-bomber-jacket",
    code: "SBJ",
    category: "jackets",
    priceCents: R(4999),
    description:
      "Cut from a buttery goat suede and lined in cupro, with a knitted collar and hem. Made in very small numbers each season by a family workshop in Cape Town.",
    details: {
      fabric: "100% goat suede. Cupro lining.",
      fit: "Regular fit.",
      care: "Specialist leather clean only.",
      madeIn: "Made in Cape Town",
    },
    colors: ["tobacco"],
    sizes: TOPS_SHORT,
    images: [px(9628536), px(4828832)],
    stock: "scarce",
    stockOverrides: { "tobacco/m": 1, "tobacco/l": 2, "tobacco/s": 0, "tobacco/xl": 1 },
    availableDaysAgo: 40,
  },

  /* ------------------------------------------------------------- Knitwear */
  {
    name: "Merino Crew Neck Knit",
    slug: "merino-crew-neck-knit",
    code: "MCN",
    category: "knitwear",
    collections: ["winter-layers", "wardrobe-essentials"],
    priceCents: R(1499),
    description:
      "Our best-selling knit: a 12-gauge extra-fine merino with a fully fashioned raglan sleeve and ribbed trims that don't lose their spring. Fine enough under a jacket, warm enough on its own.",
    details: {
      fabric: "100% extra-fine merino wool, 12-gauge",
      fit: "Regular fit.",
      care: "Hand wash cold or wool cycle. Dry flat.",
      madeIn: "Made in Cape Town",
    },
    colors: ["navy", "charcoal", "oatmeal", "bottle-green"],
    sizes: TOPS,
    images: [px(21822451), "/images/edit-knitwear.webp"],
    stock: "healthy",
    stockOverrides: { "oatmeal/m": 4, "bottle-green/l": 2, "navy/xxl": 0 },
    bestseller: true,
    featured: true,
    availableDaysAgo: 100,
  },
  {
    name: "Merino Roll Neck",
    slug: "merino-roll-neck",
    code: "MRN",
    category: "knitwear",
    collections: ["winter-layers"],
    priceCents: R(1699),
    description:
      "A slim roll neck in a soft, dense merino rib. Wear it under the overcoat in July, or on its own with the pleated trouser when the evening turns.",
    details: {
      fabric: "100% extra-fine merino wool, ribbed",
      fit: "Slim fit.",
      care: "Hand wash cold. Dry flat.",
      madeIn: "Made in Italy",
    },
    colors: ["charcoal", "camel", "black"],
    sizes: TOPS_SHORT,
    images: [px(36510876)],
    stock: "mixed",
    newArrival: true,
    availableDaysAgo: 5,
  },
  {
    name: "Cable Knit Fisherman Jumper",
    slug: "cable-knit-fisherman-jumper",
    code: "CKF",
    category: "knitwear",
    collections: ["winter-layers"],
    priceCents: R(1899),
    description:
      "A traditional cable knit in a chunky lambswool, hand-finished with a saddle shoulder and a deep ribbed hem. Heavy, warm and made to last a lifetime of Drakensberg weekends.",
    details: {
      fabric: "100% lambswool, 5-gauge",
      fit: "Relaxed fit.",
      care: "Hand wash cold. Dry flat. Store folded.",
      madeIn: "Made in Cape Town",
    },
    colors: ["tobacco", "ecru", "slate"],
    sizes: TOPS_SHORT,
    images: [px(4651447), px(7849072)],
    stock: "scarce",
    availableDaysAgo: 20,
  },
  {
    name: "Cotton Cardigan",
    slug: "cotton-cardigan",
    code: "CCD",
    category: "knitwear",
    priceCents: R(1699),
    description:
      "A relaxed, textured-knit cardigan in a soft cotton with contrast tipping at the collar and placket. Natural horn buttons and patch pockets.",
    details: {
      fabric: "100% cotton, textured knit",
      fit: "Relaxed fit.",
      care: "Machine wash cold, gentle. Dry flat.",
      madeIn: "Made in Portugal",
    },
    colors: ["cream", "black"],
    sizes: TOPS_SHORT,
    images: [px(34685800)],
    stock: "mixed",
    availableDaysAgo: 35,
  },

  /* ------------------------------------------------------------ Outerwear */
  {
    name: "Wool Overcoat",
    slug: "wool-overcoat",
    code: "WOC",
    category: "outerwear",
    collections: ["winter-layers"],
    priceCents: R(5499),
    description:
      "A single-breasted overcoat in a dense Italian wool melton with a notch lapel, welted pockets and a full satin lining. Cut long enough to cover a jacket and roomy enough to layer a knit beneath. The coat you'll wear for a decade.",
    details: {
      fabric: "90% wool, 10% cashmere melton, 620gsm",
      fit: "Regular fit. Length 100cm in size M.",
      care: "Dry clean only.",
      madeIn: "Made in Italy",
    },
    colors: ["charcoal", "camel"],
    sizes: TOPS_SHORT,
    images: [px(34082626), px(1643025), px(1643026)],
    stock: "mixed",
    newArrival: true,
    featured: true,
    availableDaysAgo: 8,
  },
  {
    name: "Double-Breasted Topcoat",
    slug: "double-breasted-topcoat",
    code: "DBT",
    category: "outerwear",
    collections: ["winter-layers"],
    priceCents: R(5999),
    description:
      "A six-button double-breasted topcoat with a wide peak lapel and a belted back. In a soft camel wool with a brushed finish. A statement piece for the coldest weeks of the year.",
    details: {
      fabric: "100% wool, brushed finish, 580gsm",
      fit: "Regular fit.",
      care: "Dry clean only.",
      madeIn: "Made in Italy",
    },
    colors: ["camel", "chocolate"],
    sizes: TOPS_SHORT,
    images: [px(29571692), px(30345955), px(18726866)],
    stock: "scarce",
    availableDaysAgo: 15,
  },
  {
    name: "Cotton Trench Coat",
    slug: "cotton-trench-coat",
    code: "TRC",
    category: "outerwear",
    priceCents: R(4499),
    description:
      "A pared-back trench in a bonded cotton gabardine with a removable belt, storm flap and horn buttons. Lightweight enough for Johannesburg's dry winter and properly showerproof for Cape Town's wet one.",
    details: {
      fabric: "100% cotton gabardine, showerproof finish",
      fit: "Regular fit. Length 105cm in size M.",
      care: "Dry clean only.",
      madeIn: "Made in Portugal",
    },
    colors: ["stone", "navy"],
    sizes: TOPS_SHORT,
    images: [px(15002783)],
    stock: "mixed",
    availableDaysAgo: 50,
  },
  {
    name: "Technical Shell Parka",
    slug: "technical-shell-parka",
    code: "TSP",
    category: "outerwear",
    collections: ["winter-layers"],
    priceCents: R(3999),
    description:
      "A three-layer waterproof shell with taped seams, a helmet-compatible hood and a longer hem for full coverage. Quiet, matte fabric and minimal branding — technical without looking like it belongs on a mountain.",
    details: {
      fabric: "3-layer recycled polyester shell, 20,000mm waterproof",
      fit: "Regular fit. Room for a mid-layer.",
      care: "Machine wash cold. Do not use fabric softener.",
      madeIn: "Made in Vietnam",
    },
    colors: ["black", "olive"],
    sizes: TOPS,
    images: [px(12455995)],
    stock: "healthy",
    availableDaysAgo: 22,
  },

  /* ---------------------------------------------------------- Accessories */
  {
    name: "Bridle Leather Belt",
    slug: "bridle-leather-belt",
    code: "BLT",
    category: "accessories",
    priceCents: R(699),
    description:
      "A 32mm belt in vegetable-tanned bridle leather with a solid brass buckle. Cut, edged and burnished by hand in our Cape Town workshop.",
    details: {
      fabric: "Full-grain vegetable-tanned leather. Solid brass hardware.",
      fit: "S fits 30–32, M fits 34–36, L fits 38–40.",
      care: "Condition occasionally with leather balm.",
      madeIn: "Made in Cape Town",
    },
    colors: ["black", "tan"],
    sizes: ["s", "m", "l"],
    images: [px(4452630), px(6127090)],
    stock: "healthy",
    availableDaysAgo: 160,
  },
  {
    name: "Leather Card Holder",
    slug: "leather-card-holder",
    code: "LCH",
    category: "accessories",
    priceCents: R(549),
    description:
      "Four card slots and a centre pocket for folded notes, in a firm full-grain leather that softens over time. Slim enough for a front pocket.",
    details: {
      fabric: "Full-grain vegetable-tanned leather",
      fit: "One size. 10cm x 7cm.",
      care: "Wipe with a dry cloth.",
      madeIn: "Made in Cape Town",
    },
    colors: ["black", "tan"],
    sizes: ONE,
    images: [px(8346477), px(28027963)],
    stock: "healthy",
    bestseller: true,
    availableDaysAgo: 110,
  },
  {
    name: "Merino Beanie",
    slug: "merino-beanie",
    code: "MBN",
    category: "accessories",
    collections: ["winter-layers"],
    priceCents: R(449),
    description:
      "A double-layer ribbed beanie in soft, non-itch merino. Fold the cuff for a short fit or wear it slouched.",
    details: {
      fabric: "100% extra-fine merino wool",
      fit: "One size.",
      care: "Hand wash cold. Dry flat.",
      madeIn: "Made in Cape Town",
    },
    colors: ["charcoal", "navy", "rust"],
    sizes: ONE,
    images: [px(6831058), px(6712090)],
    stock: "healthy",
    stockOverrides: { "rust/one-size": 3 },
    newArrival: true,
    availableDaysAgo: 11,
  },
  {
    name: "Canvas Tote",
    slug: "canvas-tote",
    code: "CVT",
    category: "accessories",
    priceCents: R(599),
    description:
      "A generous 18oz cotton canvas tote with leather-reinforced handles and an internal zip pocket. Carries a laptop, a jumper and the week's groceries.",
    details: {
      fabric: "18oz cotton canvas. Leather handle wraps.",
      fit: "One size. 42cm x 38cm x 14cm.",
      care: "Spot clean.",
      madeIn: "Made in Cape Town",
    },
    colors: ["natural"],
    sizes: ONE,
    images: [px(27292675), px(7129173)],
    stock: "healthy",
    availableDaysAgo: 75,
  },
  {
    name: "Leather Tote",
    slug: "leather-tote",
    code: "LTT",
    category: "accessories",
    priceCents: R(2999),
    description:
      "An unlined tote in a thick, supple full-grain leather that develops a deep patina. Hand-stitched handles and a single interior pocket. Made to order in small batches.",
    details: {
      fabric: "Full-grain vegetable-tanned leather, 2.2mm",
      fit: "One size. 40cm x 35cm x 12cm.",
      care: "Condition with leather balm every few months.",
      madeIn: "Made in Cape Town",
    },
    colors: ["tan", "black"],
    sizes: ONE,
    images: [px(29359844), px(29359836)],
    stock: "scarce",
    availableDaysAgo: 28,
  },
];

export const SHIPPING_METHODS = [
  {
    code: "standard",
    name: "Standard courier",
    description: "Door-to-door delivery to main centres in 2–4 working days.",
    costCents: R(95),
    freeAboveCents: R(1500),
    etaMinDays: 2,
    etaMaxDays: 4,
    position: 1,
  },
  {
    code: "express",
    name: "Express courier",
    description: "Next working day to Johannesburg, Pretoria, Cape Town and Durban.",
    costCents: R(195),
    freeAboveCents: null,
    etaMinDays: 1,
    etaMaxDays: 2,
    position: 2,
  },
];

export const PAYMENT_METHODS = [
  {
    code: "demo_card",
    name: "Credit or debit card",
    description: "Visa, Mastercard and American Express. Secured with 3D Secure.",
    position: 1,
  },
  {
    code: "demo_eft",
    name: "Instant EFT",
    description: "Pay directly from your bank account. Supports all major South African banks.",
    position: 2,
  },
];

/** Deterministic stock allocation so seeds are stable between runs. */
export function stockFor(pattern: StockPattern, index: number): number {
  const healthy = [24, 31, 18, 40, 22, 27, 35, 19, 26, 33];
  const mixed = [24, 6, 0, 2, 18, 9, 30, 3, 0, 12, 7, 21];
  const scarce = [2, 0, 1, 3, 0, 4, 1, 2, 0, 5];
  const table = pattern === "healthy" ? healthy : pattern === "mixed" ? mixed : scarce;
  return table[index % table.length];
}
