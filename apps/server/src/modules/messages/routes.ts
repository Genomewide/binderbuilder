import type { FastifyPluginAsync } from "fastify";
import { createMessagesService } from "./service.js";
import type { AppDatabase } from "../../lib/db.js";

export function messagesRoutes(db: AppDatabase): FastifyPluginAsync {
  return async (server) => {
    const service = createMessagesService(db);

    server.get<{ Querystring: { conversation_id: string } }>(
      "/messages",
      async (request, reply) => {
        const { conversation_id } = request.query;
        if (!conversation_id) {
          return reply.status(400).send({ error: "conversation_id query param is required" });
        }
        const data = await service.listByConversation(conversation_id);
        return { data };
      }
    );

    server.get<{ Params: { id: string } }>("/messages/:id", async (request, reply) => {
      try {
        return await service.getById(request.params.id);
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });

    server.post<{
      Body: {
        conversation_id: string;
        role: "system" | "user" | "assistant" | "tool";
        content_text?: string;
        status?: "pending" | "streaming" | "complete" | "error" | "cancelled";
        tool_call_json?: string;
        metadata_json?: string;
      };
    }>("/messages", async (request, reply) => {
      const { conversation_id, role, content_text, status, tool_call_json, metadata_json } =
        request.body;
      const message = await service.create({
        conversationId: conversation_id,
        role,
        contentText: content_text,
        status,
        toolCallJson: tool_call_json,
        metadataJson: metadata_json,
      });
      return reply.status(201).send(message);
    });

    server.patch<{
      Params: { id: string };
      Body: {
        content_text?: string;
        status?: "pending" | "streaming" | "complete" | "error" | "cancelled";
        tool_call_json?: string;
        metadata_json?: string;
      };
    }>("/messages/:id", async (request, reply) => {
      try {
        const { content_text, status, tool_call_json, metadata_json } = request.body;
        return await service.update(request.params.id, {
          contentText: content_text,
          status,
          toolCallJson: tool_call_json,
          metadataJson: metadata_json,
        });
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });

    server.delete<{ Params: { id: string } }>("/messages/:id", async (request, reply) => {
      try {
        await service.remove(request.params.id);
        return reply.status(204).send();
      } catch (err: any) {
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    });
  };
}
