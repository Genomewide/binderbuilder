import type { FastifyPluginAsync } from "fastify";
import { createSettingsService } from "./service.js";
import type { AppDatabase } from "../../lib/db.js";

export function settingsRoutes(db: AppDatabase): FastifyPluginAsync {
  return async (server) => {
    const service = createSettingsService(db);

    server.get("/settings", async () => {
      const data = await service.list();
      return { data };
    });

    server.get<{ Params: { key: string } }>("/settings/:key", async (request, reply) => {
      try {
        return await service.getByKey(request.params.key);
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });

    server.put<{ Params: { key: string }; Body: { value: unknown } }>(
      "/settings/:key",
      async (request, reply) => {
        const setting = await service.upsert(request.params.key, request.body.value);
        return setting;
      }
    );

    server.delete<{ Params: { key: string } }>("/settings/:key", async (request, reply) => {
      try {
        await service.remove(request.params.key);
        return reply.status(204).send();
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });
  };
}
