import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import { CommerceError, type Address, type AddressInput, type CustomerProfile } from "../types";
import { isoRequired, mapAddress } from "./shared";

function mapProfile(row: typeof s.users.$inferSelect): CustomerProfile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    createdAt: isoRequired(row.createdAt),
  };
}

export async function getProfile(userId: number): Promise<CustomerProfile | null> {
  const [row] = await db.select().from(s.users).where(eq(s.users.id, userId));
  return row ? mapProfile(row) : null;
}

export async function updateProfile(
  userId: number,
  input: { firstName: string; lastName: string; phone: string | null },
): Promise<CustomerProfile> {
  const [row] = await db
    .update(s.users)
    .set({ firstName: input.firstName, lastName: input.lastName, phone: input.phone })
    .where(eq(s.users.id, userId))
    .returning();
  if (!row) throw new CommerceError("Account not found", "not_found");
  return mapProfile(row);
}

export async function listAddresses(userId: number): Promise<Address[]> {
  const rows = await db
    .select()
    .from(s.addresses)
    .where(eq(s.addresses.userId, userId))
    .orderBy(desc(s.addresses.isDefault), asc(s.addresses.createdAt));
  return rows.map(mapAddress);
}

function toRow(userId: number, input: AddressInput) {
  return {
    userId,
    firstName: input.firstName,
    lastName: input.lastName,
    company: input.company || null,
    address1: input.address1,
    address2: input.address2 || null,
    city: input.city,
    province: input.province,
    postalCode: input.postalCode,
    phone: input.phone,
    label: input.label || null,
    isDefault: Boolean(input.isDefault),
  };
}

export async function createAddress(userId: number, input: AddressInput): Promise<Address> {
  const existing = await listAddresses(userId);
  const makeDefault = Boolean(input.isDefault) || existing.length === 0;
  if (makeDefault) {
    await db.update(s.addresses).set({ isDefault: false }).where(eq(s.addresses.userId, userId));
  }
  const [row] = await db
    .insert(s.addresses)
    .values({ ...toRow(userId, input), isDefault: makeDefault })
    .returning();
  return mapAddress(row);
}

export async function updateAddress(userId: number, addressId: number, input: AddressInput): Promise<Address> {
  if (input.isDefault) {
    await db.update(s.addresses).set({ isDefault: false }).where(eq(s.addresses.userId, userId));
  }
  const [row] = await db
    .update(s.addresses)
    .set(toRow(userId, input))
    .where(and(eq(s.addresses.id, addressId), eq(s.addresses.userId, userId)))
    .returning();
  if (!row) throw new CommerceError("Address not found", "not_found");
  return mapAddress(row);
}

export async function deleteAddress(userId: number, addressId: number): Promise<void> {
  // Orders keep referencing the address row; we only detach it from the account.
  await db
    .update(s.addresses)
    .set({ userId: null, isDefault: false })
    .where(and(eq(s.addresses.id, addressId), eq(s.addresses.userId, userId)));
}
