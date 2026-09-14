/**
 * Temporary brand configuration.
 *
 * "FORM" is a working name. Everything brand-specific the UI needs lives
 * here (and in the design tokens in src/app/globals.css) so the final
 * identity can be dropped in later without hunting through components.
 */
export const brand = {
  name: "FORM",
  legalName: "FORM Apparel (Pty) Ltd",
  tagline: "Menswear made for South African days.",
  description:
    "FORM is a South African men's apparel store: considered shirts, trousers, knitwear and outerwear, delivered nationwide.",
  domain: "form.co.za",
  supportEmail: "hello@form.co.za",
  supportPhone: "+27 21 000 0000",
  address: "12 Albert Road, Woodstock, Cape Town, 7925",
  currency: "ZAR",
  freeDeliveryThresholdCents: 150_000,
  returnsWindowDays: 30,
  social: {
    instagram: "https://instagram.com",
  },
} as const;
