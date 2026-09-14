import type {
  Address,
  AddressInput,
  CardPaymentInput,
  Cart,
  CustomerProfile,
  Order,
  OrderSummary,
  PaymentMethod,
  Product,
  ProductListResult,
  ProductQuery,
  ProductSummary,
  ShippingMethod,
  Taxon,
} from "./types";

/**
 * The single integration boundary between the storefront UI and the
 * commerce backend.
 *
 * Every method corresponds to a Spree Storefront API v2 capability:
 *
 *   listTaxons / getTaxon           → GET /api/v2/storefront/taxons
 *   listProducts / getProduct       → GET /api/v2/storefront/products
 *   getCart / createCart            → GET|POST /api/v2/storefront/cart
 *   addToCart / updateLineItem      → POST /cart/add_item, PATCH /cart/set_quantity
 *   removeLineItem                  → DELETE /cart/remove_line_item/:id
 *   checkout* / advance / complete  → PATCH /api/v2/storefront/checkout, /advance, /complete
 *   listShippingMethods / payments  → GET /checkout/shipping_rates, /checkout/payment_methods
 *   listOrders / getOrder           → GET /api/v2/storefront/account/orders
 *   addresses                       → /api/v2/storefront/account/addresses
 *
 * `orderToken` plays the role of Spree's `X-Spree-Order-Token`; `userId`
 * stands in for the customer bearer token. The local Postgres adapter
 * (./local) implements this today; a Spree adapter (./spree) replaces it
 * later without touching UI code.
 */
export interface CommerceClient {
  /* Catalogue */
  listTaxons(kind?: "category" | "collection"): Promise<Taxon[]>;
  getTaxon(permalink: string): Promise<Taxon | null>;
  listProducts(query: ProductQuery): Promise<ProductListResult>;
  getProduct(slug: string): Promise<Product | null>;
  getRelatedProducts(productId: number, limit?: number): Promise<ProductSummary[]>;
  getFeaturedProducts(kind: "new" | "bestsellers" | "featured", limit?: number): Promise<ProductSummary[]>;

  /* Cart */
  getCart(orderToken: string | null): Promise<Cart | null>;
  createCart(userId: number | null): Promise<Cart>;
  addToCart(orderToken: string, variantId: number, quantity: number): Promise<Cart>;
  setLineItemQuantity(orderToken: string, lineItemId: number, quantity: number): Promise<Cart>;
  removeLineItem(orderToken: string, lineItemId: number): Promise<Cart>;
  /** Attach a guest cart to a signed-in customer (merging any existing cart). */
  associateCart(orderToken: string, userId: number): Promise<Cart>;
  /** The customer's open (incomplete) cart, if any. */
  getCustomerCart(userId: number): Promise<Cart | null>;

  /* Checkout */
  listShippingMethods(orderToken: string): Promise<ShippingMethod[]>;
  listPaymentMethods(): Promise<PaymentMethod[]>;
  checkoutSetAddress(
    orderToken: string,
    input: { email: string; address: AddressInput; saveToAccount?: boolean; userId?: number | null },
  ): Promise<Cart>;
  checkoutSetShippingMethod(orderToken: string, shippingMethodCode: string): Promise<Cart>;
  checkoutSetPayment(orderToken: string, input: CardPaymentInput): Promise<Cart>;
  /** Move the order back to a previous step (e.g. to edit the address). */
  checkoutRewind(orderToken: string, state: "address" | "delivery" | "payment"): Promise<Cart>;
  /** Captures payment, finalises the order and books the shipment. */
  completeCheckout(orderToken: string): Promise<Order>;

  /* Orders */
  getOrderByNumber(number: string, access: { orderToken?: string | null; userId?: number | null }): Promise<Order | null>;
  listOrders(userId: number): Promise<OrderSummary[]>;

  /* Account */
  getProfile(userId: number): Promise<CustomerProfile | null>;
  updateProfile(userId: number, input: { firstName: string; lastName: string; phone: string | null }): Promise<CustomerProfile>;
  listAddresses(userId: number): Promise<Address[]>;
  createAddress(userId: number, input: AddressInput): Promise<Address>;
  updateAddress(userId: number, addressId: number, input: AddressInput): Promise<Address>;
  deleteAddress(userId: number, addressId: number): Promise<void>;
}
