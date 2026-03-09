import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api";

export interface McpServer {
  name: string;
  kind: string;
}

export interface McpTool {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: unknown;
  outputSchema?: unknown;
}

export interface McpToolCallResult {
  content: unknown;
  isError?: boolean;
}

export function useMcpServers() {
  return useQuery({
    queryKey: ["mcp-servers"],
    queryFn: () => apiFetch<{ data: McpServer[] }>("/api/mcp/servers").then((r) => r.data),
  });
}

export function useRegisterMcpServer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; kind: string }) =>
      apiFetch<McpServer>("/api/mcp/servers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mcp-servers"] });
    },
  });
}

export function useMcpTools(serverName: string | null) {
  return useQuery({
    queryKey: ["mcp-tools", serverName],
    queryFn: () =>
      apiFetch<{ data: McpTool[] }>(`/api/mcp/servers/${serverName}/tools`).then((r) => r.data),
    enabled: !!serverName,
  });
}

export function useCallMcpTool() {
  return useMutation({
    mutationFn: ({
      serverName,
      toolName,
      input,
    }: {
      serverName: string;
      toolName: string;
      input: unknown;
    }) =>
      apiFetch<McpToolCallResult>(
        `/api/mcp/servers/${serverName}/tools/${toolName}/call`,
        {
          method: "POST",
          body: JSON.stringify({ input }),
        }
      ),
  });
}
