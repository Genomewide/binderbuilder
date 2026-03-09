import type { FastifyPluginAsync } from "fastify";
import { createArtifactsService } from "./service.js";
import type { AppDatabase } from "../../lib/db.js";

export function artifactsRoutes(db: AppDatabase): FastifyPluginAsync {
  return async (server) => {
    const service = createArtifactsService(db);

    server.get<{ Querystring: { workspace_id: string } }>(
      "/artifacts",
      async (request, reply) => {
        const { workspace_id } = request.query;
        if (!workspace_id) {
          return reply.status(400).send({ error: "workspace_id query param is required" });
        }
        const data = await service.listByWorkspace(workspace_id);
        return { data };
      }
    );

    server.get<{ Params: { id: string } }>("/artifacts/:id", async (request, reply) => {
      try {
        return await service.getById(request.params.id);
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });

    server.post<{
      Body: {
        workspace_id: string;
        conversation_id?: string;
        kind: "code" | "document" | "image" | "spreadsheet" | "diagram" | "other";
        title: string;
        mime_type?: string;
        disk_path?: string;
        metadata_json?: string;
      };
    }>("/artifacts", async (request, reply) => {
      const { workspace_id, conversation_id, kind, title, mime_type, disk_path, metadata_json } =
        request.body;
      const artifact = await service.create({
        workspaceId: workspace_id,
        conversationId: conversation_id,
        kind,
        title,
        mimeType: mime_type,
        diskPath: disk_path,
        metadataJson: metadata_json,
      });
      return reply.status(201).send(artifact);
    });

    server.patch<{
      Params: { id: string };
      Body: {
        title?: string;
        kind?: "code" | "document" | "image" | "spreadsheet" | "diagram" | "other";
        mime_type?: string;
        disk_path?: string;
        metadata_json?: string;
      };
    }>("/artifacts/:id", async (request, reply) => {
      try {
        const { title, kind, mime_type, disk_path, metadata_json } = request.body;
        return await service.update(request.params.id, {
          title,
          kind,
          mimeType: mime_type,
          diskPath: disk_path,
          metadataJson: metadata_json,
        });
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });

    server.delete<{ Params: { id: string } }>("/artifacts/:id", async (request, reply) => {
      try {
        await service.remove(request.params.id);
        return reply.status(204).send();
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });
  };
}
