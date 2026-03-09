import type { FastifyPluginAsync } from "fastify";
import { createConversationsService } from "./service.js";
import type { AppDatabase } from "../../lib/db.js";

export function conversationsRoutes(db: AppDatabase): FastifyPluginAsync {
  return async (server) => {
    const service = createConversationsService(db);

    server.get<{ Querystring: { workspace_id: string } }>(
      "/conversations",
      async (request, reply) => {
        const { workspace_id } = request.query;
        if (!workspace_id) {
          return reply.status(400).send({ error: "workspace_id query param is required" });
        }
        const data = await service.listByWorkspace(workspace_id);
        return { data };
      }
    );

    server.get<{ Params: { id: string } }>("/conversations/:id", async (request, reply) => {
      try {
        return await service.getById(request.params.id);
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });

    server.post<{
      Body: {
        workspace_id: string;
        title: string;
        provider_key?: string;
        model_key?: string;
      };
    }>("/conversations", async (request, reply) => {
      const { workspace_id, title, provider_key, model_key } = request.body;
      const conversation = await service.create({
        workspaceId: workspace_id,
        title,
        providerKey: provider_key,
        modelKey: model_key,
      });
      return reply.status(201).send(conversation);
    });

    server.patch<{
      Params: { id: string };
      Body: { title?: string; provider_key?: string; model_key?: string };
    }>("/conversations/:id", async (request, reply) => {
      try {
        const { title, provider_key, model_key } = request.body;
        return await service.update(request.params.id, {
          title,
          providerKey: provider_key,
          modelKey: model_key,
        });
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });

    server.delete<{ Params: { id: string } }>("/conversations/:id", async (request, reply) => {
      try {
        await service.remove(request.params.id);
        return reply.status(204).send();
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });
  };
}
