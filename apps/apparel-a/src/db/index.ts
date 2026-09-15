import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Runtime database handle.
 *
 * On Neon we use the serverless HTTP driver: each query is a single `fetch`, so
 * a cold serverless instance skips the TCP/TLS handshake and connection pool
 * setup that dominates cold latency with `pg`. That driver only speaks to Neon's
 * proxy, so any other Postgres (local dev, Docker, another host) keeps its pooled
 * `pg` connection.
 *
 * Schema migrations and seeding always run over `pg` — see `./pg` and
 * `scripts/db-bootstrap.ts`.
 */
const isNeon = /neon\.(tech|build)/.test(databaseUrl);

export const db = (isNeon
  ? drizzleNeon(neon(databaseUrl))
  : drizzlePg(new Pool({ connectionString: databaseUrl, max: 10 }))
) as unknown as NodePgDatabase;
