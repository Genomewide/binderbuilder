import { z } from "zod";
import { idSchema, timestampsSchema } from "./common.js";

// ── Skill ───────────────────────────────────────────────────────────────────

export const skillSourceEnum = z.enum(["builtin", "community", "custom"]);
export type SkillSource = z.infer<typeof skillSourceEnum>;

export const skillCreateSchema = z.object({
  id: idSchema.optional().default(crypto.randomUUID()),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).optional(),
  source: skillSourceEnum,
  enabled: z.boolean().optional().default(true),
  metadata_json: z.record(z.unknown()).nullable().optional(),
});

export const skillUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  enabled: z.boolean().optional(),
  metadata_json: z.record(z.unknown()).nullable().optional(),
});

export const skillSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    source: skillSourceEnum,
    enabled: z.boolean(),
    metadata_json: z.record(z.unknown()).nullable(),
  })
  .merge(timestampsSchema);

export type SkillCreate = z.infer<typeof skillCreateSchema>;
export type SkillUpdate = z.infer<typeof skillUpdateSchema>;
export type Skill = z.infer<typeof skillSchema>;
