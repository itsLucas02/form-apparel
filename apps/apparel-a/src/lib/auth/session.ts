import { cache } from "react";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import { generateToken } from "@/lib/commerce/local/shared";
import type { CustomerProfile } from "@/lib/commerce/types";
import { hashPassword, verifyPassword } from "./password";

/**
 * Customer authentication.
 *
 * Spree authenticates storefront customers with OAuth bearer tokens
 * (POST /spree_oauth/token). This module owns the same responsibility for the
 * local backend: a session cookie mapped to a customer. When Spree is
 * connected, swap the internals here to store/refresh the Spree token instead.
 */

export const SESSION_COOKIE = "form_session";
export const CART_COOKIE = "form_cart_token";
const SESSION_DAYS = 30;

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export const getCurrentUser = cache(async (): Promise<CustomerProfile | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ user: s.users })
    .from(s.sessions)
    .innerJoin(s.users, eq(s.sessions.userId, s.users.id))
    .where(and(eq(s.sessions.token, token), gt(s.sessions.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;
  return {
    id: row.user.id,
    email: row.user.email,
    firstName: row.user.firstName,
    lastName: row.user.lastName,
    phone: row.user.phone,
    createdAt: row.user.createdAt.toISOString(),
  };
});

export async function createSession(userId: number): Promise<void> {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(s.sessions).values({ token, userId, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { ...cookieBase, expires: expiresAt });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(s.sessions).where(eq(s.sessions.token, token));
  store.delete(SESSION_COOKIE);
}

export async function authenticate(email: string, password: string): Promise<number | null> {
  const [user] = await db.select().from(s.users).where(eq(s.users.email, email.toLowerCase().trim()));
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return user.id;
}

export async function registerUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{ id: number } | { error: string }> {
  const email = input.email.toLowerCase().trim();
  const [existing] = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.email, email));
  if (existing) return { error: "An account with this email already exists. Try signing in." };
  const [user] = await db
    .insert(s.users)
    .values({
      email,
      passwordHash: hashPassword(input.password),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
    })
    .returning({ id: s.users.id });
  return { id: user.id };
}

/* Cart cookie helpers (the equivalent of Spree's order token). */

export async function getCartToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

export async function setCartToken(token: string | null): Promise<void> {
  const store = await cookies();
  if (!token) {
    store.delete(CART_COOKIE);
    return;
  }
  store.set(CART_COOKIE, token, { ...cookieBase, maxAge: 60 * 60 * 24 * 60 });
}
