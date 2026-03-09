import { z } from "zod";
import { idSchema, timestampsSchema } from "./common.js";

// ── Artifact ────────────────────────────────────────────────────────────────

export const artifactKindEnum = z.enum([
  "code",
  "document",
  "image",
  "spreadsheet",
  "diagram",
  "other",
]);
export type ArtifactKind = z.infer<typeof artifactKindEnum>;

export const artifactCreateSchema = z.object({
  id: idSchema.optional().default(crypto.randomUUID()),
  message_id: idSchema,
  kind: artifactKindEnum,
  title: z.string().min(1).max(500),
  mime_type: z.string().min(1).max(255),
  disk_path: z.string().min(1).max(1000).optional(),
  content_text: z.string().optional(),
  metadata_json: z.record(z.unknown()).nullable().optional(),
});

export const artifactUpdateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  kind: artifactKindEnum.optional(),
  mime_type: z.string().min(1).max(255).optional(),
  disk_path: z.string().min(1).max(1000).optional(),
  content_text: z.string().optional(),
  metadata_json: z.record(z.unknown()).nullable().optional(),
});

export const artifactSchema = z
  .object({
    id: idSchema,
    message_id: idSchema,
    kind: artifactKindEnum,
    title: z.string(),
    mime_type: z.string(),
    disk_path: z.string().nullable(),
    content_text: z.string().nullable(),
    metadata_json: z.record(z.unknown()).nullable(),
  })
  .merge(timestampsSchema);

export type ArtifactCreate = z.infer<typeof artifactCreateSchema>;
export type ArtifactUpdate = z.infer<typeof artifactUpdateSchema>;
export type Artifact = z.infer<typeof artifactSchema>;
