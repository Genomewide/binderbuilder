import { createSettingsRepository } from "./repository.js";
import type { AppDatabase } from "../../lib/db.js";

export function createSettingsService(db: AppDatabase) {
  const repo = createSettingsRepository(db);

  return {
    async list() {
      const rows = await repo.findAll();
      return rows.map((r) => ({
        key: r.key,
        value: JSON.parse(r.valueJson),
        updatedAt: r.updatedAt,
      }));
    },

    async getByKey(key: string) {
      const row = await repo.findByKey(key);
      if (!row) throw { statusCode: 404, message: "Setting not found" };
      return { key: row.key, value: JSON.parse(row.valueJson), updatedAt: row.updatedAt };
    },

    async upsert(key: string, value: unknown) {
      const row = await repo.upsert(key, JSON.stringify(value));
      return { key: row!.key, value: JSON.parse(row!.valueJson), updatedAt: row!.updatedAt };
    },

    async remove(key: string) {
      const deleted = await repo.delete(key);
      if (!deleted) throw { statusCode: 404, message: "Setting not found" };
    },
  };
}
