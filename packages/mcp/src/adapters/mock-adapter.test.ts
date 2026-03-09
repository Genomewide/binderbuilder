import { describe, it, expect } from "vitest";
import { createMockAdapter } from "./mock-adapter.js";

describe("MockAdapter", () => {
  it("connect and disconnect are no-ops", async () => {
    const adapter = createMockAdapter();
    await expect(adapter.connect()).resolves.toBeUndefined();
    await expect(adapter.disconnect()).resolves.toBeUndefined();
  });

  it("has kind 'custom'", () => {
    const adapter = createMockAdapter();
    expect(adapter.kind).toBe("custom");
  });

  it("listTools returns 2 tools", async () => {
    const adapter = createMockAdapter();
    const tools = await adapter.listTools();
    expect(tools).toHaveLength(2);
    expect(tools[0].name).toBe("echo");
    expect(tools[1].name).toBe("add");
  });

  it("listResources returns 1 resource", async () => {
    const adapter = createMockAdapter();
    const resources = await adapter.listResources();
    expect(resources).toHaveLength(1);
    expect(resources[0].name).toBe("readme");
  });

  it("callTool echoes input by default", async () => {
    const adapter = createMockAdapter();
    const result = await adapter.callTool({
      toolName: "echo",
      input: { message: "hello" },
    });
    expect(result.content).toEqual({ echo: { message: "hello" } });
    expect(result.isError).toBeUndefined();
  });

  it("callTool 'add' returns sum", async () => {
    const adapter = createMockAdapter();
    const result = await adapter.callTool({
      toolName: "add",
      input: { a: 3, b: 5 },
    });
    expect(result.content).toEqual({ result: 8 });
  });
});
