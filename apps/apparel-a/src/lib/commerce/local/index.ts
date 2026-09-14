import type { CommerceClient } from "../client";
import * as account from "./account";
import * as cart from "./cart";
import * as catalog from "./catalog";
import * as checkout from "./checkout";
import * as orders from "./orders";

/**
 * Postgres-backed implementation of the commerce contract, used while the
 * Spree backend is not available in this environment.
 */
export const localCommerce: CommerceClient = {
  listTaxons: catalog.listTaxons,
  getTaxon: catalog.getTaxon,
  listProducts: catalog.listProducts,
  getProduct: catalog.getProduct,
  getRelatedProducts: catalog.getRelatedProducts,
  getFeaturedProducts: catalog.getFeaturedProducts,

  getCart: cart.getCart,
  createCart: cart.createCart,
  addToCart: cart.addToCart,
  setLineItemQuantity: cart.setLineItemQuantity,
  removeLineItem: cart.removeLineItem,
  associateCart: cart.associateCart,
  getCustomerCart: cart.getCustomerCart,

  listShippingMethods: checkout.listShippingMethods,
  listPaymentMethods: checkout.listPaymentMethods,
  checkoutSetAddress: checkout.checkoutSetAddress,
  checkoutSetShippingMethod: checkout.checkoutSetShippingMethod,
  checkoutSetPayment: checkout.checkoutSetPayment,
  checkoutRewind: checkout.checkoutRewind,
  completeCheckout: checkout.completeCheckout,

  getOrderByNumber: orders.getOrderByNumber,
  listOrders: orders.listOrders,

  getProfile: account.getProfile,
  updateProfile: account.updateProfile,
  listAddresses: account.listAddresses,
  createAddress: account.createAddress,
  updateAddress: account.updateAddress,
  deleteAddress: account.deleteAddress,
};
