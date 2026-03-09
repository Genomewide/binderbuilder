import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@baseui/db";
import { workspacesRoutes } from "./routes.js";

let server: FastifyInstance;

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return drizzle(sqlite, { schema });
}

describe("Workspaces API", () => {
  beforeAll(async () => {
    const db = createTestDb();
    server = Fastify();
    await server.register(workspacesRoutes(db as any), { prefix: "/api" });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it("POST /api/workspaces - creates a workspace", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/workspaces",
      payload: { name: "Test Workspace", description: "A test workspace" },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.name).toBe("Test Workspace");
    expect(body.description).toBe("A test workspace");
    expect(body.id).toBeDefined();
  });

  it("GET /api/workspaces - lists workspaces", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/workspaces",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/workspaces/:id - gets a workspace by id", async () => {
    // First create one
    const createRes = await server.inject({
      method: "POST",
      url: "/api/workspaces",
      payload: { name: "Get By ID Test" },
    });
    const created = JSON.parse(createRes.body);

    const response = await server.inject({
      method: "GET",
      url: `/api/workspaces/${created.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(created.id);
    expect(body.name).toBe("Get By ID Test");
  });

  it("GET /api/workspaces/:id - returns 404 for missing workspace", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/workspaces/00000000-0000-0000-0000-000000000000",
    });

    expect(response.statusCode).toBe(404);
  });

  it("PATCH /api/workspaces/:id - updates a workspace", async () => {
    const createRes = await server.inject({
      method: "POST",
      url: "/api/workspaces",
      payload: { name: "Before Update" },
    });
    const created = JSON.parse(createRes.body);

    const response = await server.inject({
      method: "PATCH",
      url: `/api/workspaces/${created.id}`,
      payload: { name: "After Update" },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.name).toBe("After Update");
  });

  it("DELETE /api/workspaces/:id - deletes a workspace", async () => {
    const createRes = await server.inject({
      method: "POST",
      url: "/api/workspaces",
      payload: { name: "To Delete" },
    });
    const created = JSON.parse(createRes.body);

    const deleteRes = await server.inject({
      method: "DELETE",
      url: `/api/workspaces/${created.id}`,
    });

    expect(deleteRes.statusCode).toBe(204);

    // Confirm it's gone
    const getRes = await server.inject({
      method: "GET",
      url: `/api/workspaces/${created.id}`,
    });

    expect(getRes.statusCode).toBe(404);
  });

  it("DELETE /api/workspaces/:id - returns 404 for missing workspace", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/api/workspaces/00000000-0000-0000-0000-000000000000",
    });

    expect(response.statusCode).toBe(404);
  });
});
