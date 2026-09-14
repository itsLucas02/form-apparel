import path from "node:path";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "@/db";
import * as s from "@/db/schema";
import { seedDatabase } from "./seed";

let readyPromise: Promise<void> | null = null;

/**
 * Makes sure the local commerce schema exists and the demo catalogue is
 * seeded. Safe to call repeatedly; work happens once per process and is
 * serialised across processes with an advisory lock.
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
  const client = await pool.connect();
  try {
    await client.query("select pg_advisory_lock(727001)");
    const { rows } = await client.query<{ t: string | null }>("select to_regclass('public.products') as t");
    if (!rows[0]?.t) {
      await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    }
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(s.products);
    if (count === 0) {
      await seedDatabase();
    }
  } finally {
    await client.query("select pg_advisory_unlock(727001)").catch(() => undefined);
    client.release();
  }
}
