import { Pool } from "pg";
import dotenv from "dotenv";

// Ensure .env is loaded before we read DATABASE_URL
// This is needed because this module may be imported before index.ts calls dotenv.config()
dotenv.config();

// ─── Neon PostgreSQL Pool ───────────────────────────────────────────────────────
// A dedicated connection pool using `pg` for the app_config key-value store.
// This runs alongside the existing Prisma client and is specifically designed
// for Neon Serverless Postgres (requires SSL).
// ─────────────────────────────────────────────────────────────────────────────────

// Strip sslmode from the connection string — the `pg` driver doesn't parse it
// from the URL. We handle SSL explicitly via the `ssl` option below.
const connectionString = (process.env.DATABASE_URL || "").replace(
  /[?&]sslmode=[^&]*/g,
  ""
);

const pool = new Pool({
  connectionString,
  ssl: {
    // Neon requires SSL; rejectUnauthorized: false allows Neon's pooler certs
    rejectUnauthorized: false,
  },
  // Connection pool settings optimized for serverless
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log pool errors to prevent unhandled rejections
pool.on("error", (err) => {
  console.error("❌ Unexpected Neon pool error:", err.message);
});

// ─── Initialize app_config Table ────────────────────────────────────────────────
// Creates the app_config table if it doesn't already exist.
// This table stores key-value pairs (like the Upstox access_token) that need
// to persist across server restarts.
// ─────────────────────────────────────────────────────────────────────────────────

export const initAppConfigTable = async (): Promise<void> => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS app_config (
      id          SERIAL        PRIMARY KEY,
      key_name    VARCHAR(255)  UNIQUE NOT NULL,
      key_value   TEXT          NOT NULL,
      updated_at  TIMESTAMPTZ   DEFAULT NOW()
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log("✅ app_config table initialized successfully");
  } catch (error: any) {
    console.error("❌ Failed to initialize app_config table:", error.message);
    throw error;
  }
};

// ─── Get Config Value ───────────────────────────────────────────────────────────
// Retrieves the value for a given key from the app_config table.
// Returns null if the key doesn't exist.
// ─────────────────────────────────────────────────────────────────────────────────

export const getConfigValue = async (keyName: string): Promise<string | null> => {
  try {
    const result = await pool.query(
      "SELECT key_value FROM app_config WHERE key_name = $1",
      [keyName]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].key_value;
  } catch (error: any) {
    console.error(`❌ Failed to get config value for "${keyName}":`, error.message);
    return null;
  }
};

// ─── Upsert Config Value ────────────────────────────────────────────────────────
// Inserts a new key-value pair, or updates the value if the key already exists.
// Uses PostgreSQL's ON CONFLICT (UPSERT) to handle both cases atomically.
// ─────────────────────────────────────────────────────────────────────────────────

export const upsertConfigValue = async (
  keyName: string,
  keyValue: string
): Promise<void> => {
  const upsertQuery = `
    INSERT INTO app_config (key_name, key_value, updated_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (key_name)
    DO UPDATE SET
      key_value  = EXCLUDED.key_value,
      updated_at = NOW();
  `;

  try {
    await pool.query(upsertQuery, [keyName, keyValue]);
    console.log(`✅ Config "${keyName}" saved/updated successfully`);
  } catch (error: any) {
    console.error(`❌ Failed to upsert config value for "${keyName}":`, error.message);
    throw error;
  }
};

// ─── Export Pool (for advanced use or cleanup) ──────────────────────────────────

export { pool as neonPool };
