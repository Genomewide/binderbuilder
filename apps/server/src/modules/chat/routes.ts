import type { FastifyPluginAsync } from "fastify";
import { createChatService } from "./service.js";
import type { AppDatabase } from "../../lib/db.js";

export function chatRoutes(db: AppDatabase): FastifyPluginAsync {
  return async (server) => {
    const chatService = createChatService(db);

    // Non-streaming send
    server.post<{
      Params: { conversationId: string };
      Body: { content: string; provider?: string; model?: string };
    }>("/chat/:conversationId/send", async (request, reply) => {
      try {
        const { conversationId } = request.params;
        const { content, provider, model } = request.body;

        if (!content || typeof content !== "string") {
          return reply.status(400).send({ error: "content is required" });
        }

        const result = await chatService.sendMessage(
          conversationId,
          content,
          provider,
          model
        );

        return reply.status(200).send(result);
      } catch (err: any) {
        request.log.error(err);
        return reply
          .status(err.statusCode ?? 500)
          .send({ error: err.message ?? "Internal server error" });
      }
    });

    // Streaming send (SSE)
    server.post<{
      Params: { conversationId: string };
      Body: { content: string; provider?: string; model?: string };
    }>("/chat/:conversationId/stream", async (request, reply) => {
      try {
        const { conversationId } = request.params;
        const { content, provider, model } = request.body;

        if (!content || typeof content !== "string") {
          return reply.status(400).send({ error: "content is required" });
        }

        const { userMessage, stream, saveAssistantMessage } =
          await chatService.streamMessage(conversationId, content, provider, model);

        // Set SSE headers
        reply.raw.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });

        // Send user message event first
        reply.raw.write(
          `data: ${JSON.stringify({ type: "user_message", message: userMessage })}\n\n`
        );

        // Stream AI response
        let fullContent = "";
        let metadata: Record<string, unknown> | undefined;

        for await (const chunk of stream) {
          if (chunk.done) {
            metadata = {
              usage: chunk.usage,
              finishReason: chunk.finishReason,
            };
            reply.raw.write(`data: ${JSON.stringify({ done: true, ...metadata })}\n\n`);
          } else {
            fullContent += chunk.delta;
            reply.raw.write(`data: ${JSON.stringify({ delta: chunk.delta })}\n\n`);
          }
        }

        // Save the full assistant message
        const assistantMessage = await saveAssistantMessage(fullContent, metadata);
        reply.raw.write(
          `data: ${JSON.stringify({ type: "assistant_message", message: assistantMessage })}\n\n`
        );

        reply.raw.end();
      } catch (err: any) {
        request.log.error(err);
        if (!reply.raw.headersSent) {
          return reply
            .status(err.statusCode ?? 500)
            .send({ error: err.message ?? "Internal server error" });
        }
        reply.raw.write(
          `data: ${JSON.stringify({ error: err.message ?? "Internal server error" })}\n\n`
        );
        reply.raw.end();
      }
    });
  };
}
