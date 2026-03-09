import { eq } from "drizzle-orm";
import { settings } from "@baseui/db";
import type { AppDatabase } from "../../lib/db.js";

export function createSettingsRepository(db: AppDatabase) {
  return {
    async findAll() {
      return db.select().from(settings).all();
    },

    async findByKey(key: string) {
      const rows = await db.select().from(settings).where(eq(settings.key, key));
      return rows[0] ?? null;
    },

    async upsert(key: string, valueJson: string) {
      const existing = await this.findByKey(key);
      if (existing) {
        await db
          .update(settings)
          .set({ valueJson, updatedAt: new Date().toISOString() })
          .where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, valueJson });
      }
      return this.findByKey(key);
    },

    async delete(key: string) {
      const existing = await this.findByKey(key);
      if (!existing) return false;
      await db.delete(settings).where(eq(settings.key, key));
      return true;
    },
  };
}
