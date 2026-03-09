import { eq } from "drizzle-orm";
import { artifacts } from "@baseui/db";
import type { AppDatabase } from "../../lib/db.js";

export function createArtifactsRepository(db: AppDatabase) {
  return {
    async findByWorkspaceId(workspaceId: string) {
      return db
        .select()
        .from(artifacts)
        .where(eq(artifacts.workspaceId, workspaceId))
        .all();
    },

    async findById(id: string) {
      const rows = await db.select().from(artifacts).where(eq(artifacts.id, id));
      return rows[0] ?? null;
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
      const id = crypto.randomUUID();
      await db.insert(artifacts).values({
        id,
        workspaceId: data.workspaceId,
        conversationId: data.conversationId ?? null,
        kind: data.kind,
        title: data.title,
        mimeType: data.mimeType ?? null,
        diskPath: data.diskPath ?? null,
        metadataJson: data.metadataJson ?? null,
      });
      return this.findById(id);
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
      await db
        .update(artifacts)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(artifacts.id, id));
      return this.findById(id);
    },

    async delete(id: string) {
      const existing = await this.findById(id);
      if (!existing) return false;
      await db.delete(artifacts).where(eq(artifacts.id, id));
      return true;
    },
  };
}
