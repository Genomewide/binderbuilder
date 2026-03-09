import { z } from "zod";
import { idSchema, timestampsSchema } from "./common.js";

// ── File ────────────────────────────────────────────────────────────────────

export const fileCreateSchema = z.object({
  id: idSchema.optional().default(crypto.randomUUID()),
  workspace_id: idSchema,
  display_name: z.string().min(1).max(255),
  original_name: z.string().min(1).max(500),
  mime_type: z.string().min(1).max(255),
  size_bytes: z.number().int().nonnegative(),
  disk_path: z.string().min(1).max(1000),
});

export const fileUpdateSchema = z.object({
  display_name: z.string().min(1).max(255).optional(),
});

export const fileSchema = z
  .object({
    id: idSchema,
    workspace_id: idSchema,
    display_name: z.string(),
    original_name: z.string(),
    mime_type: z.string(),
    size_bytes: z.number().int(),
    disk_path: z.string(),
  })
  .merge(timestampsSchema);

export type FileCreate = z.infer<typeof fileCreateSchema>;
export type FileUpdate = z.infer<typeof fileUpdateSchema>;
export type FileRecord = z.infer<typeof fileSchema>;
