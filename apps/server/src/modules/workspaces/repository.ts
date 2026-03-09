import { eq } from "drizzle-orm";
import { workspaces } from "@baseui/db";
import type { AppDatabase } from "../../lib/db.js";

export function createWorkspacesRepository(db: AppDatabase) {
  return {
    async findAll() {
      return db.select().from(workspaces).all();
    },

    async findById(id: string) {
      const rows = await db.select().from(workspaces).where(eq(workspaces.id, id));
      return rows[0] ?? null;
    },

    async create(data: { id?: string; name: string; description?: string | null }) {
      const id = data.id ?? crypto.randomUUID();
      await db.insert(workspaces).values({
        id,
        name: data.name,
        description: data.description ?? null,
      });
      return this.findById(id);
    },

    async update(id: string, data: { name?: string; description?: string | null }) {
      await db
        .update(workspaces)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(workspaces.id, id));
      return this.findById(id);
    },

    async delete(id: string) {
      const existing = await this.findById(id);
      if (!existing) return false;
      await db.delete(workspaces).where(eq(workspaces.id, id));
      return true;
    },
  };
}
