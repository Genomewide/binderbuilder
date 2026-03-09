import { z } from "zod";
import { idSchema, timestampsSchema } from "./common.js";

// ── Workspace ───────────────────────────────────────────────────────────────

export const workspaceCreateSchema = z.object({
  id: idSchema.optional().default(crypto.randomUUID()),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
});

export const workspaceUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
});

export const workspaceSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    description: z.string().nullable(),
  })
  .merge(timestampsSchema);

export type WorkspaceCreate = z.infer<typeof workspaceCreateSchema>;
export type WorkspaceUpdate = z.infer<typeof workspaceUpdateSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
