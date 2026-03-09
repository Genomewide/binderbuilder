import { z } from "zod";
import { idSchema, timestampsSchema } from "./common.js";

// ── Conversation ────────────────────────────────────────────────────────────

export const conversationCreateSchema = z.object({
  id: idSchema.optional().default(crypto.randomUUID()),
  workspace_id: idSchema,
  title: z.string().min(1).max(500).optional(),
  provider_key: z.string().min(1).max(100),
  model_key: z.string().min(1).max(100),
});

export const conversationUpdateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  provider_key: z.string().min(1).max(100).optional(),
  model_key: z.string().min(1).max(100).optional(),
});

export const conversationSchema = z
  .object({
    id: idSchema,
    workspace_id: idSchema,
    title: z.string().nullable(),
    provider_key: z.string(),
    model_key: z.string(),
  })
  .merge(timestampsSchema);

export type ConversationCreate = z.infer<typeof conversationCreateSchema>;
export type ConversationUpdate = z.infer<typeof conversationUpdateSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
