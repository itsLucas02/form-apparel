import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __formApparelPgPool?: Pool;
};

/**
 * Direct (node-postgres) database handle.
 *
 * Only used by the out-of-band bootstrap/seed path (`pnpm db:seed`), which runs
 * migrations and bulk inserts — work that is easier over a real connection than
 * the HTTP driver. The app's request path uses `./index` instead.
 */
export const pool =
  globalForDb.__formApparelPgPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__formApparelPgPool = pool;
}

export const db = drizzle(pool);
