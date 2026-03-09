import { eq } from "drizzle-orm";
import { conversations } from "@baseui/db";
import type { AppDatabase } from "../../lib/db.js";

export function createConversationsRepository(db: AppDatabase) {
  return {
    async findByWorkspaceId(workspaceId: string) {
      return db
        .select()
        .from(conversations)
        .where(eq(conversations.workspaceId, workspaceId))
        .all();
    },

    async findById(id: string) {
      const rows = await db.select().from(conversations).where(eq(conversations.id, id));
      return rows[0] ?? null;
    },

    async create(data: {
      workspaceId: string;
      title: string;
      providerKey?: string | null;
      modelKey?: string | null;
    }) {
      const id = crypto.randomUUID();
      await db.insert(conversations).values({
        id,
        workspaceId: data.workspaceId,
        title: data.title,
        providerKey: data.providerKey ?? null,
        modelKey: data.modelKey ?? null,
      });
      return this.findById(id);
    },

    async update(
      id: string,
      data: { title?: string; providerKey?: string | null; modelKey?: string | null }
    ) {
      await db
        .update(conversations)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(conversations.id, id));
      return this.findById(id);
    },

    async delete(id: string) {
      const existing = await this.findById(id);
      if (!existing) return false;
      await db.delete(conversations).where(eq(conversations.id, id));
      return true;
    },
  };
}
