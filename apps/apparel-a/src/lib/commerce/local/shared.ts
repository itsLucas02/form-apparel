import { randomBytes, randomInt } from "node:crypto";
import type * as s from "@/db/schema";
import type { Address, OptionTypeName, OptionValue, StockInfo } from "../types";

/** Low-stock thresholds shown to customers (variant level). */
export const VERY_LOW_STOCK_THRESHOLD = 3;
export const LOW_STOCK_THRESHOLD = 8;

export function stockInfo(countOnHand: number, backorderable: boolean): StockInfo {
  if (countOnHand <= 0) {
    return backorderable
      ? { countOnHand, backorderable, purchasable: true, level: "backorder", message: "Available on backorder" }
      : { countOnHand, backorderable, purchasable: false, level: "out_of_stock", message: "Out of stock" };
  }
  if (countOnHand <= VERY_LOW_STOCK_THRESHOLD) {
    return {
      countOnHand,
      backorderable,
      purchasable: true,
      level: "very_low",
      message: countOnHand === 1 ? "Only 1 left" : `Only ${countOnHand} left`,
    };
  }
  if (countOnHand <= LOW_STOCK_THRESHOLD) {
    return { countOnHand, backorderable, purchasable: true, level: "low", message: "Low stock" };
  }
  return { countOnHand, backorderable, purchasable: true, level: "in_stock", message: null };
}

export function mapOptionValue(
  row: typeof s.optionValues.$inferSelect,
  optionTypeName: OptionTypeName,
): OptionValue {
  return {
    id: row.id,
    optionType: optionTypeName,
    name: row.name,
    presentation: row.presentation,
    position: row.position,
    hex: row.hex,
  };
}

export function mapAddress(row: typeof s.addresses.$inferSelect): Address {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    company: row.company,
    address1: row.address1,
    address2: row.address2,
    city: row.city,
    province: row.province,
    postalCode: row.postalCode,
    countryIso: row.countryIso,
    phone: row.phone,
    label: row.label,
    isDefault: row.isDefault,
  };
}

/** Spree-style order numbers: "R" + 9 digits. */
export function generateOrderNumber(): string {
  return `R${randomInt(100_000_000, 999_999_999)}`;
}

/** Spree-style shipment numbers: "H" + 11 digits. */
export function generateShipmentNumber(): string {
  return `H${randomInt(10_000_000_000, 99_999_999_999)}`;
}

export function generateToken(bytes = 24): string {
  return randomBytes(bytes).toString("hex");
}

export function iso(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null;
}

export function isoRequired(date: Date): string {
  return date.toISOString();
}
