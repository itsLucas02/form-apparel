import type { CommerceClient } from "./client";
import { localCommerce } from "./local";
import { spreeCommerce } from "./spree";

export type { CommerceClient } from "./client";
export * from "./types";

/**
 * The commerce backend used by the storefront.
 *
 *  - `local` (default): Postgres-backed demo implementation (src/lib/commerce/local)
 *  - `spree`: Spree Storefront API adapter (src/lib/commerce/spree)
 */
export const commerce: CommerceClient =
  process.env.COMMERCE_BACKEND === "spree" ? spreeCommerce : localCommerce;
