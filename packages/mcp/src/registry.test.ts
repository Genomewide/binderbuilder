import { describe, it, expect, beforeEach } from "vitest";
import { registerServer, getServer, listServers, removeServer, clearServers } from "./registry.js";
import { createMockAdapter } from "./adapters/mock-adapter.js";

describe("McpServerRegistry", () => {
  beforeEach(() => {
    clearServers();
  });

  it("registers and retrieves a server", () => {
    const adapter = createMockAdapter();
    registerServer("test-server", adapter);

    const retrieved = getServer("test-server");
    expect(retrieved).toBe(adapter);
  });

  it("returns undefined for unknown server", () => {
    expect(getServer("nonexistent")).toBeUndefined();
  });

  it("lists all registered servers", () => {
    registerServer("server-a", createMockAdapter());
    registerServer("server-b", createMockAdapter());

    const servers = listServers();
    expect(servers).toHaveLength(2);
    expect(servers).toEqual(
      expect.arrayContaining([
        { name: "server-a", kind: "custom" },
        { name: "server-b", kind: "custom" },
      ])
    );
  });

  it("removes a server", () => {
    registerServer("to-remove", createMockAdapter());
    expect(getServer("to-remove")).toBeDefined();

    removeServer("to-remove");
    expect(getServer("to-remove")).toBeUndefined();
  });

  it("removing a nonexistent server is a no-op", () => {
    expect(() => removeServer("nonexistent")).not.toThrow();
  });

  it("clears all servers", () => {
    registerServer("a", createMockAdapter());
    registerServer("b", createMockAdapter());
    clearServers();
    expect(listServers()).toHaveLength(0);
  });
});
