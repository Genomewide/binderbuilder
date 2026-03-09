import { createMessagesRepository } from "./repository.js";
import type { AppDatabase } from "../../lib/db.js";

export function createMessagesService(db: AppDatabase) {
  const repo = createMessagesRepository(db);

  return {
    async listByConversation(conversationId: string) {
      return repo.findByConversationId(conversationId);
    },

    async getById(id: string) {
      const message = await repo.findById(id);
      if (!message) throw { statusCode: 404, message: "Message not found" };
      return message;
    },

    async create(data: {
      conversationId: string;
      role: "system" | "user" | "assistant" | "tool";
      contentText?: string | null;
      status?: "pending" | "streaming" | "complete" | "error" | "cancelled";
      toolCallJson?: string | null;
      metadataJson?: string | null;
    }) {
      return repo.create(data);
    },

    async update(
      id: string,
      data: {
        contentText?: string | null;
        status?: "pending" | "streaming" | "complete" | "error" | "cancelled";
        toolCallJson?: string | null;
        metadataJson?: string | null;
      }
    ) {
      await this.getById(id);
      return repo.update(id, data);
    },

    async remove(id: string) {
      const deleted = await repo.delete(id);
      if (!deleted) throw { statusCode: 404, message: "Message not found" };
    },
  };
}
