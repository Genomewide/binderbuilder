import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import { getDbPath } from "./runtime-paths.js";

let _db: ReturnType<typeof createDb> | null = null;

function createDb(dbPath?: string) {
  const sqlite = new Database(dbPath ?? getDbPath());
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export function getDb(dbPath?: string) {
  if (!_db) {
    _db = createDb(dbPath);
  }
  return _db;
}

export function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export type AppDatabase = ReturnType<typeof getDb>;
