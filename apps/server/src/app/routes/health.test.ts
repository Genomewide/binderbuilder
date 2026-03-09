import { describe, it, expect } from "vitest";
import { buildServer } from "../server.js";

describe("GET /api/health", () => {
  it("returns ok status", async () => {
    const server = await buildServer();
    const response = await server.inject({
      method: "GET",
      url: "/api/health",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();

    await server.close();
  });
});
