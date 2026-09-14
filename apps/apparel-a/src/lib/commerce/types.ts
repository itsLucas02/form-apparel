/**
 * Storefront-facing commerce domain types.
 *
 * Shapes follow Spree's Storefront API v2 resources (product, variant,
 * option_type, option_value, taxon, cart/order, line_item, address,
 * shipment, payment) so that a Spree-backed adapter can populate them
 * without changing any UI code. All monetary values are integer cents (ZAR).
 */

export type OptionTypeName = "color" | "size";

export interface OptionValue {
  id: number;
  optionType: OptionTypeName;
  name: string;
  presentation: string;
  position: number;
  hex: string | null;
}

export interface OptionType {
  id: number;
  name: OptionTypeName;
  presentation: string;
  position: number;
  values: OptionValue[];
}

export type StockLevel = "in_stock" | "low" | "very_low" | "out_of_stock" | "backorder";

export interface StockInfo {
  countOnHand: number;
  backorderable: boolean;
  purchasable: boolean;
  level: StockLevel;
  /** Customer-facing message, e.g. "Only 2 left". */
  message: string | null;
}

export interface Variant {
  id: number;
  sku: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  isMaster: boolean;
  position: number;
  optionValues: OptionValue[];
  color: OptionValue | null;
  size: OptionValue | null;
  stock: StockInfo;
}

export interface ProductImage {
  id: number;
  url: string;
  alt: string;
  position: number;
  /** Colour option value this image belongs to (null = generic). */
  optionValueId: number | null;
}

export type TaxonKind = "category" | "collection";

export interface Taxon {
  id: number;
  name: string;
  permalink: string;
  kind: TaxonKind;
  description: string | null;
  imageUrl: string | null;
  position: number;
  productCount?: number;
}

export interface ProductDetails {
  fabric?: string;
  fit?: string;
  care?: string;
  madeIn?: string;
  [key: string]: string | undefined;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  thumbnailUrl: string | null;
  hoverImageUrl: string | null;
  colors: OptionValue[];
  purchasable: boolean;
  lowStock: boolean;
  newArrival: boolean;
  bestseller: boolean;
  categoryName: string | null;
}

export interface Product extends ProductSummary {
  featured: boolean;
  description: string;
  details: ProductDetails;
  images: ProductImage[];
  optionTypes: OptionType[];
  variants: Variant[];
  taxons: Taxon[];
  sizes: OptionValue[];
  availableOn: string;
}

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export interface ProductQuery {
  q?: string;
  taxon?: string; // permalink
  categories?: string[]; // permalinks
  sizes?: string[]; // option value names
  colors?: string[]; // option value names
  minPriceCents?: number;
  maxPriceCents?: number;
  inStockOnly?: boolean;
  sort?: SortOption;
  page?: number;
  perPage?: number;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
  hex?: string | null;
}

export interface ProductFacets {
  categories: FacetOption[];
  sizes: FacetOption[];
  colors: FacetOption[];
  priceMinCents: number;
  priceMaxCents: number;
}

export interface ProductListResult {
  products: ProductSummary[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: ProductFacets;
}

/* ------------------------------------------------------------------ */
/* Customer / orders                                                   */
/* ------------------------------------------------------------------ */

export interface Address {
  id: number;
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  postalCode: string;
  countryIso: string;
  phone: string;
  label: string | null;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, "id" | "isDefault" | "countryIso"> & {
  isDefault?: boolean;
};

export interface ShippingMethod {
  id: number;
  code: string;
  name: string;
  description: string;
  costCents: number;
  freeAboveCents: number | null;
  etaMinDays: number;
  etaMaxDays: number;
}

export interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  description: string;
}

export type PaymentState = "checkout" | "pending" | "completed" | "failed";

export interface Payment {
  id: number;
  method: PaymentMethod;
  amountCents: number;
  state: PaymentState;
  reference: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  createdAt: string;
}

export interface TrackingEvent {
  id: number;
  code: string;
  title: string;
  description: string;
  location: string | null;
  occurredAt: string;
}

export type ShipmentState = "pending" | "ready" | "shipped" | "delivered";

export interface Shipment {
  id: number;
  number: string;
  state: ShipmentState;
  courierName: string | null;
  waybillNumber: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  events: TrackingEvent[];
}

export interface LineItem {
  id: number;
  variantId: number;
  quantity: number;
  priceCents: number;
  totalCents: number;
  product: { id: number; name: string; slug: string };
  variant: {
    sku: string;
    color: OptionValue | null;
    size: OptionValue | null;
    imageUrl: string | null;
    stock: StockInfo;
  };
}

export type OrderState = "cart" | "address" | "delivery" | "payment" | "confirm" | "complete";

export interface Order {
  id: number;
  number: string;
  token: string;
  state: OrderState;
  email: string | null;
  currency: string;
  itemCount: number;
  itemTotalCents: number;
  shipmentTotalCents: number;
  totalCents: number;
  shipAddress: Address | null;
  billAddress: Address | null;
  shippingMethod: ShippingMethod | null;
  paymentState: string | null;
  shipmentState: ShipmentState | null;
  lineItems: LineItem[];
  payments: Payment[];
  shipments: Shipment[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A cart is simply an order that has not been completed. */
export type Cart = Order;

export interface OrderSummary {
  id: number;
  number: string;
  state: OrderState;
  itemCount: number;
  totalCents: number;
  paymentState: string | null;
  shipmentState: ShipmentState | null;
  completedAt: string | null;
  thumbnailUrls: string[];
  firstItemName: string | null;
}

export interface CustomerProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  createdAt: string;
}

export interface CardPaymentInput {
  methodCode: string;
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
}

export class CommerceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "not_found"
      | "out_of_stock"
      | "invalid_state"
      | "validation"
      | "payment_failed"
      | "not_configured" = "validation",
  ) {
    super(message);
    this.name = "CommerceError";
  }
}
