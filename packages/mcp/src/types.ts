export interface McpToolDefinition {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: unknown;
  outputSchema?: unknown;
}

export interface McpResourceDefinition {
  name: string;
  uri: string;
  description?: string;
  mimeType?: string;
}

export interface McpToolCallInput {
  toolName: string;
  input: unknown;
}

export interface McpToolCallResult {
  content: unknown;
  isError?: boolean;
}

export interface McpTransportAdapter {
  kind: "stdio" | "streamable-http" | "custom";
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  listTools(): Promise<McpToolDefinition[]>;
  listResources(): Promise<McpResourceDefinition[]>;
  callTool(input: McpToolCallInput): Promise<McpToolCallResult>;
}
