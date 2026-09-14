"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticate,
  createSession,
  destroySession,
  getCartToken,
  registerUser,
  setCartToken,
} from "@/lib/auth/session";
import { commerce } from "@/lib/commerce";

export interface AuthState {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

const str = (fd: FormData, key: string) => (fd.get(key)?.toString() ?? "").trim();

function safeNext(value: string): string | null {
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}

/** After sign-in, attach the guest cart to the customer (or restore theirs). */
async function reconcileCart(userId: number) {
  const token = await getCartToken();
  if (token) {
    try {
      const cart = await commerce.associateCart(token, userId);
      await setCartToken(cart.token);
      return;
    } catch {
      /* token no longer valid – fall through */
    }
  }
  const existing = await commerce.getCustomerCart(userId);
  await setCartToken(existing?.token ?? null);
}

export async function loginAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email").toLowerCase();
  const password = fd.get("password")?.toString() ?? "";
  const next = safeNext(str(fd, "next")) ?? "/account";
  if (!email || !password) return { error: "Enter your email and password.", values: { email } };

  const userId = await authenticate(email, password);
  if (!userId) return { error: "Incorrect email or password.", values: { email } };

  await createSession(userId);
  await reconcileCart(userId);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function registerAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const values = {
    firstName: str(fd, "firstName"),
    lastName: str(fd, "lastName"),
    email: str(fd, "email").toLowerCase(),
  };
  const password = fd.get("password")?.toString() ?? "";
  const next = safeNext(str(fd, "next")) ?? "/account";

  const fieldErrors: Record<string, string> = {};
  if (!values.firstName) fieldErrors.firstName = "Required";
  if (!values.lastName) fieldErrors.lastName = "Required";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) fieldErrors.email = "Enter a valid email address";
  if (password.length < 8) fieldErrors.password = "Use at least 8 characters";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values, error: "Please check the highlighted fields." };

  const result = await registerUser({ ...values, password });
  if ("error" in result) return { error: result.error, values };

  await createSession(result.id);
  await reconcileCart(result.id);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  await setCartToken(null);
  revalidatePath("/", "layout");
  redirect("/");
}
