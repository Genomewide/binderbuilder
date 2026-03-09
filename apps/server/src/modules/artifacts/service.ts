import { createArtifactsRepository } from "./repository.js";
import type { AppDatabase } from "../../lib/db.js";

export function createArtifactsService(db: AppDatabase) {
  const repo = createArtifactsRepository(db);

  return {
    async listByWorkspace(workspaceId: string) {
      return repo.findByWorkspaceId(workspaceId);
    },

    async getById(id: string) {
      const artifact = await repo.findById(id);
      if (!artifact) throw { statusCode: 404, message: "Artifact not found" };
      return artifact;
    },

    async create(data: {
      workspaceId: string;
      conversationId?: string | null;
      kind: "code" | "document" | "image" | "spreadsheet" | "diagram" | "other";
      title: string;
      mimeType?: string | null;
      diskPath?: string | null;
      metadataJson?: string | null;
    }) {
      return repo.create(data);
    },

    async update(
      id: string,
      data: {
        title?: string;
        kind?: "code" | "document" | "image" | "spreadsheet" | "diagram" | "other";
        mimeType?: string | null;
        diskPath?: string | null;
        metadataJson?: string | null;
      }
    ) {
      await this.getById(id);
      return repo.update(id, data);
    },

    async remove(id: string) {
      const deleted = await repo.delete(id);
      if (!deleted) throw { statusCode: 404, message: "Artifact not found" };
    },
  };
}
