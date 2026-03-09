import {
  registerServer,
  getServer,
  listServers,
  removeServer,
  createMockAdapter,
  type McpTransportAdapter,
} from "@baseui/mcp";

export function createMcpService() {
  return {
    registerServer(config: { name: string; kind: string }) {
      // For now, always create a mock adapter regardless of kind
      const adapter: McpTransportAdapter = createMockAdapter();
      registerServer(config.name, adapter);
      return { name: config.name, kind: adapter.kind };
    },

    listServers() {
      return listServers();
    },

    async getServerTools(serverId: string) {
      const adapter = getServer(serverId);
      if (!adapter) {
        throw { statusCode: 404, message: `Server '${serverId}' not found` };
      }
      await adapter.connect();
      return adapter.listTools();
    },

    async callTool(serverId: string, toolName: string, input: unknown) {
      const adapter = getServer(serverId);
      if (!adapter) {
        throw { statusCode: 404, message: `Server '${serverId}' not found` };
      }
      await adapter.connect();
      return adapter.callTool({ toolName, input });
    },

    removeServer(serverId: string) {
      removeServer(serverId);
    },
  };
}
