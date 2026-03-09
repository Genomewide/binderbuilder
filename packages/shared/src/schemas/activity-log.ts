import { z } from "zod";
import { idSchema, timestampSchema } from "./common.js";

// ── Activity Log ────────────────────────────────────────────────────────────

export const activityActionEnum = z.enum([
  "create",
  "update",
  "delete",
  "execute",
  "login",
  "logout",
  "error",
]);
export type ActivityAction = z.infer<typeof activityActionEnum>;

export const activityLogCreateSchema = z.object({
  id: idSchema.optional().default(crypto.randomUUID()),
  workspace_id: idSchema.nullable().optional(),
  entity_type: z.string().min(1).max(100),
  entity_id: idSchema.nullable().optional(),
  action: activityActionEnum,
  summary: z.string().max(2000).optional(),
  metadata_json: z.record(z.unknown()).nullable().optional(),
});

export const activityLogSchema = z.object({
  id: idSchema,
  workspace_id: idSchema.nullable(),
  entity_type: z.string(),
  entity_id: idSchema.nullable(),
  action: activityActionEnum,
  summary: z.string().nullable(),
  metadata_json: z.record(z.unknown()).nullable(),
  created_at: timestampSchema,
});

export type ActivityLogCreate = z.infer<typeof activityLogCreateSchema>;
export type ActivityLog = z.infer<typeof activityLogSchema>;
