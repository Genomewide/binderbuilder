import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@baseui/db";
import { registerProvider, echoProvider } from "@baseui/ai";
import { chatRoutes } from "./routes.js";
import { messagesRoutes } from "../messages/routes.js";

let server: FastifyInstance;
let conversationId: string;

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      provider_key TEXT,
      model_key TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content_text TEXT,
      status TEXT NOT NULL DEFAULT 'complete',
      tool_call_json TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed a workspace and conversation
  const workspaceId = crypto.randomUUID();
  conversationId = crypto.randomUUID();

  sqlite.exec(`
    INSERT INTO workspaces (id, name) VALUES ('${workspaceId}', 'Test Workspace');
    INSERT INTO conversations (id, workspace_id, title) VALUES ('${conversationId}', '${workspaceId}', 'Test Conversation');
  `);

  return drizzle(sqlite, { schema });
}

describe("Chat API", () => {
  beforeAll(async () => {
    registerProvider(echoProvider);
    const db = createTestDb();
    server = Fastify();
    await server.register(chatRoutes(db as any), { prefix: "/api" });
    await server.register(messagesRoutes(db as any), { prefix: "/api" });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it("POST /api/chat/:conversationId/send - sends a message and gets echo response", async () => {
    const response = await server.inject({
      method: "POST",
      url: `/api/chat/${conversationId}/send`,
      payload: { content: "Hello AI", provider: "echo" },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.userMessage).toBeDefined();
    expect(body.userMessage.role).toBe("user");
    expect(body.userMessage.contentText).toBe("Hello AI");
    expect(body.assistantMessage).toBeDefined();
    expect(body.assistantMessage.role).toBe("assistant");
    expect(body.assistantMessage.contentText).toBe("Echo: Hello AI");
  });

  it("POST /api/chat/:conversationId/send - returns 400 with missing content", async () => {
    const response = await server.inject({
      method: "POST",
      url: `/api/chat/${conversationId}/send`,
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it("messages are persisted after send", async () => {
    const response = await server.inject({
      method: "GET",
      url: `/api/messages?conversation_id=${conversationId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.data.length).toBeGreaterThanOrEqual(2);
  });
});
