import type {
  McpTransportAdapter,
  McpToolDefinition,
  McpResourceDefinition,
  McpToolCallInput,
  McpToolCallResult,
} from "../types.js";

export function createMockAdapter(): McpTransportAdapter {
  return {
    kind: "custom",

    async connect(): Promise<void> {
      // no-op
    },

    async disconnect(): Promise<void> {
      // no-op
    },

    async listTools(): Promise<McpToolDefinition[]> {
      return [
        {
          name: "echo",
          title: "Echo Tool",
          description: "Echoes back the input",
          inputSchema: { type: "object", properties: { message: { type: "string" } } },
        },
        {
          name: "add",
          title: "Add Numbers",
          description: "Adds two numbers together",
          inputSchema: {
            type: "object",
            properties: { a: { type: "number" }, b: { type: "number" } },
          },
        },
      ];
    },

    async listResources(): Promise<McpResourceDefinition[]> {
      return [
        {
          name: "readme",
          uri: "file:///README.md",
          description: "Project README",
          mimeType: "text/markdown",
        },
      ];
    },

    async callTool(input: McpToolCallInput): Promise<McpToolCallResult> {
      if (input.toolName === "add") {
        const { a, b } = input.input as { a: number; b: number };
        return { content: { result: a + b } };
      }
      return { content: { echo: input.input } };
    },
  };
}
