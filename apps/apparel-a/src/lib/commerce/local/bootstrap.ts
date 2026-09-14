import path from "node:path";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db";
import * as s from "@/db/schema";
import { seedDatabase } from "./seed";

let readyPromise: Promise<void> | null = null;

/**
 * Ensures the commerce schema exists and the demo catalogue is seeded.
 *
 * Intentionally NOT called from the request lifecycle. Run it explicitly via
 * `pnpm db:seed` (which uses the unpooled connection), or let it run once at
 * local-dev server start via `instrumentation.ts`. Bootstrapping inside a
 * request is unsafe on serverless: migrations and session-level advisory locks
 * do not belong in a pooled, short-lived request connection.
 */
export function ensureCommerceReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = bootstrap().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }
  return readyPromise;
}

async function bootstrap(): Promise<void> {
  const existing = await db.execute<{ t: string | null }>(
    sql`select to_regclass('public.products') as t`,
  );
  if (!existing.rows[0]?.t) {
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  }
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(s.products);
  if (count === 0) {
    await seedDatabase();
  }
}
