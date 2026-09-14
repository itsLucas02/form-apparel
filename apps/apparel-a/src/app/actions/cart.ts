"use server";

import { commerce, CommerceError, type Cart } from "@/lib/commerce";
import { getCartToken, getCurrentUser, setCartToken } from "@/lib/auth/session";

export type CartActionResult = { ok: true; cart: Cart } | { ok: false; error: string; cart: Cart | null };

/** Resolve (or lazily create) the visitor's cart token – Spree's order token. */
export async function resolveCartToken(options: { create: boolean }): Promise<string | null> {
  const token = await getCartToken();
  if (token) {
    const cart = await commerce.getCart(token);
    if (cart) return token;
  }
  if (!options.create) return null;

  const user = await getCurrentUser();
  if (user) {
    const existing = await commerce.getCustomerCart(user.id);
    if (existing) {
      await setCartToken(existing.token);
      return existing.token;
    }
  }
  const cart = await commerce.createCart(user?.id ?? null);
  await setCartToken(cart.token);
  return cart.token;
}

function failure(error: unknown, cart: Cart | null): CartActionResult {
  const message =
    error instanceof CommerceError ? error.message : "Something went wrong updating your cart. Please try again.";
  return { ok: false, error: message, cart };
}

export async function getCartAction(): Promise<Cart | null> {
  const token = await getCartToken();
  return commerce.getCart(token);
}

export async function addToCartAction(variantId: number, quantity: number): Promise<CartActionResult> {
  const token = await resolveCartToken({ create: true });
  if (!token) return { ok: false, error: "Could not start a cart", cart: null };
  try {
    const cart = await commerce.addToCart(token, variantId, quantity);
    return { ok: true, cart };
  } catch (error) {
    return failure(error, await commerce.getCart(token));
  }
}

export async function updateLineItemAction(lineItemId: number, quantity: number): Promise<CartActionResult> {
  const token = await resolveCartToken({ create: false });
  if (!token) return { ok: false, error: "Your cart has expired", cart: null };
  try {
    const cart = await commerce.setLineItemQuantity(token, lineItemId, quantity);
    return { ok: true, cart };
  } catch (error) {
    return failure(error, await commerce.getCart(token));
  }
}

export async function removeLineItemAction(lineItemId: number): Promise<CartActionResult> {
  const token = await resolveCartToken({ create: false });
  if (!token) return { ok: false, error: "Your cart has expired", cart: null };
  try {
    const cart = await commerce.removeLineItem(token, lineItemId);
    return { ok: true, cart };
  } catch (error) {
    return failure(error, await commerce.getCart(token));
  }
}
