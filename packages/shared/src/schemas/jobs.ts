import { z } from "zod";
import { idSchema, timestampsSchema } from "./common.js";

// ── Enums ───────────────────────────────────────────────────────────────────

export const jobKindEnum = z.enum([
  "inference",
  "embedding",
  "file_processing",
  "export",
  "import",
  "other",
]);
export type JobKind = z.infer<typeof jobKindEnum>;

export const jobStatusEnum = z.enum([
  "queued",
  "running",
  "complete",
  "failed",
  "cancelled",
]);
export type JobStatus = z.infer<typeof jobStatusEnum>;

// ── Job ─────────────────────────────────────────────────────────────────────

export const jobCreateSchema = z.object({
  id: idSchema.optional().default(crypto.randomUUID()),
  workspace_id: idSchema,
  kind: jobKindEnum,
  status: jobStatusEnum.optional().default("queued"),
  progress: z.number().min(0).max(100).optional().default(0),
  payload_json: z.record(z.unknown()).nullable().optional(),
});

export const jobUpdateSchema = z.object({
  status: jobStatusEnum.optional(),
  progress: z.number().min(0).max(100).optional(),
  result_json: z.record(z.unknown()).nullable().optional(),
  error_text: z.string().nullable().optional(),
});

export const jobSchema = z
  .object({
    id: idSchema,
    workspace_id: idSchema,
    kind: jobKindEnum,
    status: jobStatusEnum,
    progress: z.number(),
    payload_json: z.record(z.unknown()).nullable(),
    result_json: z.record(z.unknown()).nullable(),
    error_text: z.string().nullable(),
  })
  .merge(timestampsSchema);

export type JobCreate = z.infer<typeof jobCreateSchema>;
export type JobUpdate = z.infer<typeof jobUpdateSchema>;
export type Job = z.infer<typeof jobSchema>;
