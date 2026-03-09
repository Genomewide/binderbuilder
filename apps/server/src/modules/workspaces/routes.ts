import type { FastifyPluginAsync } from "fastify";
import { createWorkspacesService } from "./service.js";
import type { AppDatabase } from "../../lib/db.js";

export function workspacesRoutes(db: AppDatabase): FastifyPluginAsync {
  return async (server) => {
    const service = createWorkspacesService(db);

    server.get("/workspaces", async () => {
      const data = await service.list();
      return { data };
    });

    server.get<{ Params: { id: string } }>("/workspaces/:id", async (request, reply) => {
      try {
        const workspace = await service.getById(request.params.id);
        return workspace;
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });

    server.post<{ Body: { name: string; description?: string } }>(
      "/workspaces",
      async (request, reply) => {
        const workspace = await service.create(request.body);
        return reply.status(201).send(workspace);
      }
    );

    server.patch<{ Params: { id: string }; Body: { name?: string; description?: string } }>(
      "/workspaces/:id",
      async (request, reply) => {
        try {
          const workspace = await service.update(request.params.id, request.body);
          return workspace;
        } catch (err: any) {
          return reply.status(err.statusCode ?? 500).send({ error: err.message });
        }
      }
    );

    server.delete<{ Params: { id: string } }>("/workspaces/:id", async (request, reply) => {
      try {
        await service.remove(request.params.id);
        return reply.status(204).send();
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });
  };
}
