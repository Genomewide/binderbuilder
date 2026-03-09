import { createConversationsRepository } from "./repository.js";
import type { AppDatabase } from "../../lib/db.js";

export function createConversationsService(db: AppDatabase) {
  const repo = createConversationsRepository(db);

  return {
    async listByWorkspace(workspaceId: string) {
      return repo.findByWorkspaceId(workspaceId);
    },

    async getById(id: string) {
      const conversation = await repo.findById(id);
      if (!conversation) throw { statusCode: 404, message: "Conversation not found" };
      return conversation;
    },

    async create(data: {
      workspaceId: string;
      title: string;
      providerKey?: string | null;
      modelKey?: string | null;
    }) {
      return repo.create(data);
    },

    async update(
      id: string,
      data: { title?: string; providerKey?: string | null; modelKey?: string | null }
    ) {
      await this.getById(id);
      return repo.update(id, data);
    },

    async remove(id: string) {
      const deleted = await repo.delete(id);
      if (!deleted) throw { statusCode: 404, message: "Conversation not found" };
    },
  };
}
