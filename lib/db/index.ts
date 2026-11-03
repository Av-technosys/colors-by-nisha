import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Add it to your environment before using the database.");
}

const globalForDb = globalThis as typeof globalThis & { pgPool?: Pool };

function createPool() {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on("error", error => {
    console.error("PostgreSQL pool error:", error);
  });

  return pool;
}

const cachedPool = globalForDb.pgPool;
const reusePool = cachedPool && !cachedPool.ending && cachedPool.options.connectionString === databaseUrl;
export const pool = reusePool ? cachedPool : createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
  if (cachedPool && cachedPool !== pool && !cachedPool.ending) {
    void cachedPool.end().catch(() => {});
  }
}

export const db = drizzle({ client: pool, schema });
