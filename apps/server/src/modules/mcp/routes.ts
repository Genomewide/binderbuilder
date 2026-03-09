import type { FastifyPluginAsync } from "fastify";
import { createMcpService } from "./service.js";

export function mcpRoutes(): FastifyPluginAsync {
  return async (server) => {
    const service = createMcpService();

    // GET /mcp/servers - list registered servers
    server.get("/mcp/servers", async () => {
      const data = service.listServers();
      return { data };
    });

    // POST /mcp/servers - register a new server
    server.post<{ Body: { name: string; kind: string } }>(
      "/mcp/servers",
      async (request, reply) => {
        const { name, kind } = request.body;
        if (!name) {
          return reply.status(400).send({ error: "name is required" });
        }
        const result = service.registerServer({ name, kind: kind ?? "custom" });
        return reply.status(201).send(result);
      }
    );

    // GET /mcp/servers/:name/tools - list tools for a server
    server.get<{ Params: { name: string } }>(
      "/mcp/servers/:name/tools",
      async (request, reply) => {
        try {
          const tools = await service.getServerTools(request.params.name);
          return { data: tools };
        } catch (err: any) {
          return reply.status(err.statusCode ?? 500).send({ error: err.message });
        }
      }
    );

    // POST /mcp/servers/:name/tools/:toolName/call - call a tool
    server.post<{ Params: { name: string; toolName: string }; Body: { input?: unknown } }>(
      "/mcp/servers/:name/tools/:toolName/call",
      async (request, reply) => {
        try {
          const result = await service.callTool(
            request.params.name,
            request.params.toolName,
            request.body?.input ?? {}
          );
          return result;
        } catch (err: any) {
          return reply.status(err.statusCode ?? 500).send({ error: err.message });
        }
      }
    );

    // DELETE /mcp/servers/:name - remove server
    server.delete<{ Params: { name: string } }>(
      "/mcp/servers/:name",
      async (request, reply) => {
        service.removeServer(request.params.name);
        return reply.status(204).send();
      }
    );
  };
}
