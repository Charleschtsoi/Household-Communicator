import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getSql() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!sql) sql = neon(url);
  return sql;
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getSql();
      await db`
        CREATE TABLE IF NOT EXISTS households (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          invite_code TEXT NOT NULL UNIQUE,
          currency TEXT NOT NULL DEFAULT 'HKD',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await db`
        CREATE TABLE IF NOT EXISTS members (
          id TEXT PRIMARY KEY,
          household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
          display_name TEXT NOT NULL,
          role TEXT NOT NULL,
          locale TEXT NOT NULL DEFAULT 'en',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await db`CREATE INDEX IF NOT EXISTS members_household_idx ON members(household_id)`;
      await db`
        CREATE TABLE IF NOT EXISTS needs (
          id TEXT PRIMARY KEY,
          household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          category TEXT NOT NULL,
          status TEXT NOT NULL,
          claimed_by_id TEXT REFERENCES members(id) ON DELETE SET NULL,
          urgent BOOLEAN NOT NULL DEFAULT FALSE,
          recurring_cadence TEXT,
          notes TEXT,
          created_by_id TEXT NOT NULL REFERENCES members(id),
          bought_at TIMESTAMPTZ,
          bought_by_id TEXT REFERENCES members(id) ON DELETE SET NULL,
          amount DOUBLE PRECISION,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await db`CREATE INDEX IF NOT EXISTS needs_household_idx ON needs(household_id)`;
      await db`CREATE INDEX IF NOT EXISTS needs_status_idx ON needs(household_id, status)`;
      await db`
        CREATE TABLE IF NOT EXISTS presence (
          member_id TEXT PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
          household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
          status TEXT NOT NULL,
          place_text TEXT,
          back_by TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await db`CREATE INDEX IF NOT EXISTS presence_household_idx ON presence(household_id)`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}
