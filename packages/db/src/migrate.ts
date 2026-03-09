import Database from "better-sqlite3";
import { getDbPath } from "./runtime-paths.js";
import * as schema from "./schema.js";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";

/**
 * Push schema directly to SQLite (dev convenience).
 * For production, use drizzle-kit migrations.
 */
export function pushSchema(dbPath?: string) {
  const path = dbPath ?? getDbPath();
  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });

  // Create tables using raw SQL derived from schema
  // This is a simple push approach for dev
  const tables = [
    sql`CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    sql`CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      provider_key TEXT,
      model_key TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    sql`CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
      content_text TEXT,
      status TEXT NOT NULL DEFAULT 'complete' CHECK (status IN ('pending', 'streaming', 'complete', 'error', 'cancelled')),
      tool_call_json TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    sql`CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
      kind TEXT NOT NULL CHECK (kind IN ('code', 'document', 'image', 'spreadsheet', 'diagram', 'other')),
      title TEXT NOT NULL,
      mime_type TEXT,
      disk_path TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    sql`CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      display_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      disk_path TEXT NOT NULL,
      metadata_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    sql`CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'complete', 'failed', 'cancelled')),
      progress REAL DEFAULT 0,
      payload_json TEXT,
      result_json TEXT,
      error_text TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    sql`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    sql`CREATE TABLE IF NOT EXISTS mcp_servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('stdio', 'streamable-http', 'custom')),
      connection_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
      last_seen_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    sql`CREATE TABLE IF NOT EXISTS mcp_tools (
      id TEXT PRIMARY KEY,
      mcp_server_id TEXT NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE,
      tool_name TEXT NOT NULL,
      title TEXT,
      description TEXT,
      input_schema_json TEXT,
      output_schema_json TEXT,
      metadata_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    sql`CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'custom' CHECK (source IN ('builtin', 'community', 'custom')),
      metadata_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    sql`CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      workspace_id TEXT,
      kind TEXT NOT NULL,
      actor TEXT,
      summary TEXT,
      payload_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ];

  for (const stmt of tables) {
    db.run(stmt);
  }

  sqlite.close();
}
