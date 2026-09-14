/**
 * Local commerce schema.
 *
 * These tables intentionally mirror Spree Commerce's core concepts
 * (taxons, option types/values, products, variants, stock items, orders,
 * line items, payments, shipments, addresses) so that the storefront's data
 * contracts map 1:1 onto Spree's Storefront API when the real backend is
 * connected. See docs/commerce-integration.md.
 *
 * Money is stored as integer cents in ZAR.
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export const taxons = pgTable("taxons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  permalink: text("permalink").notNull().unique(),
  /** "category" (Shirts, Trousers…) or "collection" (curated edits). */
  kind: text("kind").notNull().default("category"),
  description: text("description"),
  imageUrl: text("image_url"),
  position: integer("position").notNull().default(0),
});

export const optionTypes = pgTable("option_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // "color" | "size"
  presentation: text("presentation").notNull(),
  position: integer("position").notNull().default(0),
});

export const optionValues = pgTable(
  "option_values",
  {
    id: serial("id").primaryKey(),
    optionTypeId: integer("option_type_id")
      .notNull()
      .references(() => optionTypes.id),
    name: text("name").notNull(),
    presentation: text("presentation").notNull(),
    position: integer("position").notNull().default(0),
    /** Swatch colour for colour option values. */
    hex: text("hex"),
  },
  (t) => [uniqueIndex("option_values_type_name_idx").on(t.optionTypeId, t.name)],
);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  compareAtPriceCents: integer("compare_at_price_cents"),
  availableOn: timestamp("available_on", { withTimezone: true }).defaultNow().notNull(),
  featured: boolean("featured").notNull().default(false),
  newArrival: boolean("new_arrival").notNull().default(false),
  bestseller: boolean("bestseller").notNull().default(false),
  /** Product properties (fabric, fit, care, origin) – Spree "product properties". */
  details: jsonb("details").$type<Record<string, string>>().notNull().default({}),
  createdAt: createdAt(),
});

export const productsTaxons = pgTable(
  "products_taxons",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    taxonId: integer("taxon_id")
      .notNull()
      .references(() => taxons.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.taxonId] })],
);

export const productOptionTypes = pgTable(
  "product_option_types",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    optionTypeId: integer("option_type_id")
      .notNull()
      .references(() => optionTypes.id),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.optionTypeId] })],
);

export const variants = pgTable(
  "variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    /** Optional price override; falls back to the product (master) price. */
    priceCents: integer("price_cents"),
    isMaster: boolean("is_master").notNull().default(false),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("variants_product_idx").on(t.productId)],
);

export const optionValueVariants = pgTable(
  "option_value_variants",
  {
    variantId: integer("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    optionValueId: integer("option_value_id")
      .notNull()
      .references(() => optionValues.id),
  },
  (t) => [primaryKey({ columns: [t.variantId, t.optionValueId] })],
);

/** Single stock location; Spree supports many, the storefront only needs totals. */
export const stockItems = pgTable("stock_items", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id")
    .notNull()
    .unique()
    .references(() => variants.id, { onDelete: "cascade" }),
  countOnHand: integer("count_on_hand").notNull().default(0),
  backorderable: boolean("backorderable").notNull().default(false),
});

export const images = pgTable(
  "images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    /** When set, the image belongs to a specific colour of the product. */
    optionValueId: integer("option_value_id").references(() => optionValues.id),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("images_product_idx").on(t.productId)],
);

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  createdAt: createdAt(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    company: text("company"),
    address1: text("address1").notNull(),
    address2: text("address2"),
    city: text("city").notNull(),
    /** South African province, e.g. "Gauteng". */
    province: text("province").notNull(),
    postalCode: text("postal_code").notNull(),
    countryIso: text("country_iso").notNull().default("ZA"),
    phone: text("phone").notNull(),
    label: text("label"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("addresses_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Orders / checkout                                                   */
/* ------------------------------------------------------------------ */

export const shippingMethods = pgTable("shipping_methods", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  costCents: integer("cost_cents").notNull(),
  /** Free when the order item total reaches this amount. */
  freeAboveCents: integer("free_above_cents"),
  etaMinDays: integer("eta_min_days").notNull(),
  etaMaxDays: integer("eta_max_days").notNull(),
  position: integer("position").notNull().default(0),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // "demo_card" | "demo_eft"
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  active: boolean("active").notNull().default(true),
  position: integer("position").notNull().default(0),
});

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    number: text("number").notNull().unique(),
    /** Guest/cart token – the equivalent of Spree's order token. */
    token: text("token").notNull().unique(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email"),
    /** Spree checkout states: cart → address → delivery → payment → confirm → complete. */
    state: text("state").notNull().default("cart"),
    currency: text("currency").notNull().default("ZAR"),
    itemCount: integer("item_count").notNull().default(0),
    itemTotalCents: integer("item_total_cents").notNull().default(0),
    shipmentTotalCents: integer("shipment_total_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    shipAddressId: integer("ship_address_id").references(() => addresses.id),
    billAddressId: integer("bill_address_id").references(() => addresses.id),
    shippingMethodId: integer("shipping_method_id").references(() => shippingMethods.id),
    paymentState: text("payment_state"), // balance_due | paid | failed
    shipmentState: text("shipment_state"), // pending | ready | shipped | delivered
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("orders_user_idx").on(t.userId), index("orders_state_idx").on(t.state)],
);

export const lineItems = pgTable(
  "line_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: integer("variant_id")
      .notNull()
      .references(() => variants.id),
    quantity: integer("quantity").notNull(),
    priceCents: integer("price_cents").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("line_items_order_idx").on(t.orderId)],
);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  paymentMethodId: integer("payment_method_id")
    .notNull()
    .references(() => paymentMethods.id),
  amountCents: integer("amount_cents").notNull(),
  /** checkout | pending | completed | failed */
  state: text("state").notNull().default("checkout"),
  /** Gateway reference (simulated for now). */
  reference: text("reference"),
  cardBrand: text("card_brand"),
  cardLast4: text("card_last4"),
  createdAt: createdAt(),
});

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  number: text("number").notNull().unique(),
  /** pending | ready | shipped | delivered */
  state: text("state").notNull().default("pending"),
  courierName: text("courier_name"),
  waybillNumber: text("waybill_number"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  estimatedDelivery: timestamp("estimated_delivery", { withTimezone: true }),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const trackingEvents = pgTable(
  "tracking_events",
  {
    id: serial("id").primaryKey(),
    shipmentId: integer("shipment_id")
      .notNull()
      .references(() => shipments.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    location: text("location"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("tracking_events_shipment_idx").on(t.shipmentId)],
);
