import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { clearServers } from "@baseui/mcp";
import { mcpRoutes } from "./routes.js";

let server: FastifyInstance;

describe("MCP API", () => {
  beforeAll(async () => {
    server = Fastify();
    await server.register(mcpRoutes(), { prefix: "/api" });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    clearServers();
  });

  it("GET /api/mcp/servers - returns empty list initially", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/mcp/servers",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.data).toEqual([]);
  });

  it("POST /api/mcp/servers - registers a server", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/mcp/servers",
      payload: { name: "test-server", kind: "custom" },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.name).toBe("test-server");
    expect(body.kind).toBe("custom");
  });

  it("GET /api/mcp/servers - lists registered servers", async () => {
    // Register a server first
    await server.inject({
      method: "POST",
      url: "/api/mcp/servers",
      payload: { name: "my-server", kind: "stdio" },
    });

    const response = await server.inject({
      method: "GET",
      url: "/api/mcp/servers",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe("my-server");
  });

  it("GET /api/mcp/servers/:name/tools - lists tools for a server", async () => {
    await server.inject({
      method: "POST",
      url: "/api/mcp/servers",
      payload: { name: "tool-server", kind: "custom" },
    });

    const response = await server.inject({
      method: "GET",
      url: "/api/mcp/servers/tool-server/tools",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].name).toBe("echo");
    expect(body.data[1].name).toBe("add");
  });

  it("GET /api/mcp/servers/:name/tools - returns 404 for unknown server", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/mcp/servers/nonexistent/tools",
    });

    expect(response.statusCode).toBe(404);
  });

  it("POST /api/mcp/servers/:name/tools/:toolName/call - calls a tool", async () => {
    await server.inject({
      method: "POST",
      url: "/api/mcp/servers",
      payload: { name: "call-server", kind: "custom" },
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/mcp/servers/call-server/tools/add/call",
      payload: { input: { a: 2, b: 3 } },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.content).toEqual({ result: 5 });
  });

  it("DELETE /api/mcp/servers/:name - removes a server", async () => {
    await server.inject({
      method: "POST",
      url: "/api/mcp/servers",
      payload: { name: "delete-me", kind: "custom" },
    });

    const deleteResponse = await server.inject({
      method: "DELETE",
      url: "/api/mcp/servers/delete-me",
    });

    expect(deleteResponse.statusCode).toBe(204);

    // Verify it's gone
    const listResponse = await server.inject({
      method: "GET",
      url: "/api/mcp/servers",
    });

    const body = JSON.parse(listResponse.body);
    expect(body.data).toEqual([]);
  });
});
