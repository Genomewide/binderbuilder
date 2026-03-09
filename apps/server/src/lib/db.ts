import { getDb, pushSchema, type AppDatabase } from "@baseui/db";

let initialized = false;

/**
 * Initialize the database: push schema (dev) and return the db instance.
 */
export function initDb(): AppDatabase {
  if (!initialized) {
    pushSchema();
    initialized = true;
  }
  return getDb();
}

/**
 * Get the current database instance (must call initDb first in production,
 * but this is safe to call in tests that set up their own db).
 */
export { getDb, type AppDatabase };
