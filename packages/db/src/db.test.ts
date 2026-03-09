import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "./schema.js";

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });

  // Create tables
  sqlite.exec(`
    CREATE TABLE workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE conversations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      provider_key TEXT,
      model_key TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content_text TEXT,
      status TEXT NOT NULL DEFAULT 'complete',
      tool_call_json TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}

describe("db schema", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("creates and reads a workspace", () => {
    const id = crypto.randomUUID();
    db.insert(schema.workspaces).values({ id, name: "Test WS" }).run();

    const rows = db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, id))
      .all();

    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Test WS");
    expect(rows[0].createdAt).toBeDefined();
  });

  it("creates conversation linked to workspace", () => {
    const wsId = crypto.randomUUID();
    const convId = crypto.randomUUID();

    db.insert(schema.workspaces).values({ id: wsId, name: "WS" }).run();
    db.insert(schema.conversations)
      .values({ id: convId, workspaceId: wsId, title: "Chat 1" })
      .run();

    const rows = db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.workspaceId, wsId))
      .all();

    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("Chat 1");
  });

  it("cascades delete from workspace to conversations", () => {
    const wsId = crypto.randomUUID();
    db.insert(schema.workspaces).values({ id: wsId, name: "WS" }).run();
    db.insert(schema.conversations)
      .values({ id: crypto.randomUUID(), workspaceId: wsId, title: "Chat" })
      .run();

    db.delete(schema.workspaces)
      .where(eq(schema.workspaces.id, wsId))
      .run();

    const convs = db.select().from(schema.conversations).all();
    expect(convs).toHaveLength(0);
  });

  it("creates and reads messages", () => {
    const wsId = crypto.randomUUID();
    const convId = crypto.randomUUID();

    db.insert(schema.workspaces).values({ id: wsId, name: "WS" }).run();
    db.insert(schema.conversations)
      .values({ id: convId, workspaceId: wsId, title: "Chat" })
      .run();
    db.insert(schema.messages)
      .values({
        id: crypto.randomUUID(),
        conversationId: convId,
        role: "user",
        contentText: "Hello",
      })
      .run();

    const msgs = db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, convId))
      .all();

    expect(msgs).toHaveLength(1);
    expect(msgs[0].role).toBe("user");
    expect(msgs[0].status).toBe("complete");
  });

  it("handles settings key-value store", () => {
    db.insert(schema.settings)
      .values({ key: "theme", valueJson: JSON.stringify({ mode: "dark" }) })
      .run();

    const rows = db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "theme"))
      .all();

    expect(rows).toHaveLength(1);
    expect(JSON.parse(rows[0].valueJson)).toEqual({ mode: "dark" });
  });
});
