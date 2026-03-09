import { createWorkspacesRepository } from "./repository.js";
import type { AppDatabase } from "../../lib/db.js";

export function createWorkspacesService(db: AppDatabase) {
  const repo = createWorkspacesRepository(db);

  return {
    async list() {
      return repo.findAll();
    },

    async getById(id: string) {
      const workspace = await repo.findById(id);
      if (!workspace) throw { statusCode: 404, message: "Workspace not found" };
      return workspace;
    },

    async create(data: { name: string; description?: string | null }) {
      return repo.create(data);
    },

    async update(id: string, data: { name?: string; description?: string | null }) {
      await this.getById(id); // throws 404 if missing
      return repo.update(id, data);
    },

    async remove(id: string) {
      const deleted = await repo.delete(id);
      if (!deleted) throw { statusCode: 404, message: "Workspace not found" };
    },
  };
}
