import type { McpTransportAdapter } from "./types.js";

const servers = new Map<string, McpTransportAdapter>();

export function registerServer(name: string, adapter: McpTransportAdapter): void {
  servers.set(name, adapter);
}

export function getServer(name: string): McpTransportAdapter | undefined {
  return servers.get(name);
}

export function listServers(): { name: string; kind: string }[] {
  return Array.from(servers.entries()).map(([name, adapter]) => ({
    name,
    kind: adapter.kind,
  }));
}

export function removeServer(name: string): void {
  servers.delete(name);
}

/** Clear all servers (useful for testing) */
export function clearServers(): void {
  servers.clear();
}
