import type { CommerceClient } from "../client";
import { CommerceError } from "../types";

/**
 * Spree Storefront API adapter (to be completed outside the Arena sandbox).
 *
 * Wire-up guide for the next agent:
 *
 *  - Base URL: `${SPREE_API_URL}/api/v2/storefront`
 *  - Catalogue: GET /products?include=variants,option_types,images,taxons
 *      &filter[taxons]=…&filter[options][color]=…&filter[price]=min,max
 *      &filter[in_stock]=true&sort=price|-price|-available_on|name
 *    Map `data.attributes` + `included` onto the types in ../types
 *    (variant `option_values`, `in_stock`, `backorderable`, `total_on_hand`).
 *  - Cart: POST /cart (returns `token`), GET /cart, POST /cart/add_item,
 *    PATCH /cart/set_quantity, DELETE /cart/remove_line_item/:id,
 *    PATCH /cart/associate?guest_order_token=…  – send `X-Spree-Order-Token`.
 *  - Checkout: PATCH /checkout (address/shipping/payment), GET
 *    /checkout/shipping_rates, GET /checkout/payment_methods, PATCH
 *    /checkout/next|advance, PATCH /checkout/complete.
 *    The payment method selected here must be a Spree payment method backed
 *    by the gateway chosen later (e.g. a South African PSP). The demo
 *    gateway in ../local/providers.ts shows the expected result shape.
 *  - Account: /account, /account/orders, /account/addresses with a customer
 *    bearer token from POST /spree_oauth/token.
 *  - Shipments/tracking: Spree exposes shipment `tracking` + `tracking_url`;
 *    the courier integration should populate those and optionally a richer
 *    event history (see Shipment.events in ../types).
 *
 * Select this adapter with `COMMERCE_BACKEND=spree`.
 */
function notConfigured(): never {
  throw new CommerceError(
    "Spree backend is not configured. Set SPREE_API_URL and implement src/lib/commerce/spree.",
    "not_configured",
  );
}

export const spreeCommerce: CommerceClient = {
  listTaxons: notConfigured,
  getTaxon: notConfigured,
  listProducts: notConfigured,
  getProduct: notConfigured,
  getRelatedProducts: notConfigured,
  getFeaturedProducts: notConfigured,
  getCart: notConfigured,
  createCart: notConfigured,
  addToCart: notConfigured,
  setLineItemQuantity: notConfigured,
  removeLineItem: notConfigured,
  associateCart: notConfigured,
  getCustomerCart: notConfigured,
  listShippingMethods: notConfigured,
  listPaymentMethods: notConfigured,
  checkoutSetAddress: notConfigured,
  checkoutSetShippingMethod: notConfigured,
  checkoutSetPayment: notConfigured,
  checkoutRewind: notConfigured,
  completeCheckout: notConfigured,
  getOrderByNumber: notConfigured,
  listOrders: notConfigured,
  getProfile: notConfigured,
  updateProfile: notConfigured,
  listAddresses: notConfigured,
  createAddress: notConfigured,
  updateAddress: notConfigured,
  deleteAddress: notConfigured,
};
