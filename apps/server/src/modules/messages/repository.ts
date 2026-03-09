import { eq } from "drizzle-orm";
import { messages } from "@baseui/db";
import type { AppDatabase } from "../../lib/db.js";

export function createMessagesRepository(db: AppDatabase) {
  return {
    async findByConversationId(conversationId: string) {
      return db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .all();
    },

    async findById(id: string) {
      const rows = await db.select().from(messages).where(eq(messages.id, id));
      return rows[0] ?? null;
    },

    async create(data: {
      conversationId: string;
      role: "system" | "user" | "assistant" | "tool";
      contentText?: string | null;
      status?: "pending" | "streaming" | "complete" | "error" | "cancelled";
      toolCallJson?: string | null;
      metadataJson?: string | null;
    }) {
      const id = crypto.randomUUID();
      await db.insert(messages).values({
        id,
        conversationId: data.conversationId,
        role: data.role,
        contentText: data.contentText ?? null,
        status: data.status ?? "complete",
        toolCallJson: data.toolCallJson ?? null,
        metadataJson: data.metadataJson ?? null,
      });
      return this.findById(id);
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
      await db.update(messages).set(data).where(eq(messages.id, id));
      return this.findById(id);
    },

    async delete(id: string) {
      const existing = await this.findById(id);
      if (!existing) return false;
      await db.delete(messages).where(eq(messages.id, id));
      return true;
    },
  };
}
