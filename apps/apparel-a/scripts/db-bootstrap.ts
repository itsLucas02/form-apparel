/**
 * Migrates and seeds the local commerce schema against DATABASE_URL.
 *
 *   pnpm db:seed             # migrate (if needed) + seed (if empty)
 *   pnpm db:reset            # truncate everything first, then seed
 *
 * Run this before first use / after a fresh deploy. It intentionally runs
 * outside the request lifecycle and, when available, uses the unpooled
 * connection string (migrations should not go through a transaction pooler).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { getTableName, is, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  process.chdir(root);

  config({ path: path.join(root, ".env.local") });
  config({ path: path.join(root, ".env") });

  if (process.env.DATABASE_URL_UNPOOLED) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set (add it to .env.local or the environment).");
    process.exit(1);
  }

  const reset = process.argv.includes("--reset");

  const schema = await import("../src/db/schema");
  const { db } = await import("../src/db/pg");
  const { ensureCommerceReady } = await import("../src/lib/commerce/local/bootstrap");

  if (reset) {
    const tables = Object.values(schema)
      .filter((value) => is(value, PgTable))
      .map((table) => `"${getTableName(table as PgTable)}"`);
    if (tables.length) {
      await db.execute(sql.raw(`truncate table ${tables.join(", ")} restart identity cascade`));
      console.log(`Reset ${tables.length} tables.`);
    }
  }

  await ensureCommerceReady();
  console.log("Commerce ready.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
