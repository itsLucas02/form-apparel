"use server";

import { redirect } from "next/navigation";
import { getCartToken, getCurrentUser, setCartToken } from "@/lib/auth/session";
import { commerce, CommerceError, type AddressInput } from "@/lib/commerce";
import { validateAddress } from "@/lib/za";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

const str = (fd: FormData, key: string) => (fd.get(key)?.toString() ?? "").trim();

async function requireToken(): Promise<string> {
  const token = await getCartToken();
  if (!token) redirect("/cart");
  return token;
}

function messageFor(error: unknown): string {
  return error instanceof CommerceError ? error.message : "Something went wrong. Please try again.";
}

export async function submitAddressAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = await requireToken();
  const user = await getCurrentUser();
  const email = user?.email ?? str(fd, "email").toLowerCase();
  const savedAddressId = Number(str(fd, "savedAddressId")) || null;

  const values = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, v.toString()]));
  const fieldErrors: Record<string, string> = {};
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fieldErrors.email = "Enter a valid email address";

  let address: AddressInput;
  if (savedAddressId && user) {
    const saved = (await commerce.listAddresses(user.id)).find((a) => a.id === savedAddressId);
    if (!saved) return { error: "That saved address is no longer available.", values };
    address = { ...saved };
  } else {
    const { input, errors } = validateAddress(fd);
    Object.assign(fieldErrors, errors);
    address = input;
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors, values, error: "Please check the highlighted fields." };

  try {
    await commerce.checkoutSetAddress(token, {
      email,
      address,
      saveToAccount: !savedAddressId && fd.get("saveAddress") === "on",
      userId: user?.id ?? null,
    });
  } catch (error) {
    return { error: messageFor(error), values };
  }
  redirect("/checkout?step=delivery");
}

export async function submitDeliveryAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = await requireToken();
  const code = str(fd, "shippingMethod");
  if (!code) return { error: "Choose a delivery option." };
  try {
    await commerce.checkoutSetShippingMethod(token, code);
  } catch (error) {
    return { error: messageFor(error) };
  }
  redirect("/checkout?step=payment");
}

export async function submitPaymentAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = await requireToken();
  const methodCode = str(fd, "paymentMethod");
  const values = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, v.toString()]));
  const fieldErrors: Record<string, string> = {};

  if (methodCode === "demo_card") {
    const digits = str(fd, "cardNumber").replace(/\s+/g, "");
    if (!str(fd, "cardholderName")) fieldErrors.cardholderName = "Name as it appears on the card";
    if (!/^\d{15,16}$/.test(digits)) fieldErrors.cardNumber = "Enter a valid card number";
    if (!/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(str(fd, "expiry"))) fieldErrors.expiry = "MM/YY";
    if (!/^\d{3,4}$/.test(str(fd, "cvc"))) fieldErrors.cvc = "3–4 digits";
  } else if (methodCode === "demo_eft") {
    if (!str(fd, "bank")) fieldErrors.bank = "Choose your bank";
  } else {
    return { error: "Choose a payment method.", values };
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors, values, error: "Please check the highlighted fields." };

  try {
    await commerce.checkoutSetPayment(token, {
      methodCode,
      cardholderName: str(fd, "cardholderName") || undefined,
      cardNumber: str(fd, "cardNumber") || undefined,
      expiry: str(fd, "expiry") || undefined,
    });
  } catch (error) {
    return { error: messageFor(error), values };
  }
  redirect("/checkout?step=review");
}

export async function placeOrderAction(): Promise<void> {
  const token = await requireToken();
  let redirectTo: string;
  try {
    const order = await commerce.completeCheckout(token);
    await setCartToken(null);
    redirectTo = `/orders/${order.number}?t=${order.token}&placed=1`;
  } catch (error) {
    const message = messageFor(error);
    const state = error instanceof CommerceError && error.code === "out_of_stock" ? "address" : "payment";
    redirectTo = `/checkout?step=${state}&error=${encodeURIComponent(message)}`;
  }
  redirect(redirectTo);
}

export async function rewindCheckoutAction(step: "address" | "delivery" | "payment"): Promise<void> {
  const token = await requireToken();
  try {
    await commerce.checkoutRewind(token, step);
  } catch {
    /* ignore – page will re-derive the step */
  }
  redirect(`/checkout?step=${step}`);
}
