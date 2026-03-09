import { z } from "zod";
import { idSchema, timestampsSchema } from "./common.js";

// ── Enums ───────────────────────────────────────────────────────────────────

export const messageRoleEnum = z.enum(["system", "user", "assistant", "tool"]);
export type MessageRole = z.infer<typeof messageRoleEnum>;

export const messageStatusEnum = z.enum([
  "pending",
  "streaming",
  "complete",
  "error",
  "cancelled",
]);
export type MessageStatus = z.infer<typeof messageStatusEnum>;

// ── Message ─────────────────────────────────────────────────────────────────

export const messageCreateSchema = z.object({
  id: idSchema.optional().default(crypto.randomUUID()),
  conversation_id: idSchema,
  role: messageRoleEnum,
  content_text: z.string().optional(),
  status: messageStatusEnum.optional().default("pending"),
  tool_call_json: z.record(z.unknown()).nullable().optional(),
  metadata_json: z.record(z.unknown()).nullable().optional(),
});

export const messageUpdateSchema = z.object({
  content_text: z.string().optional(),
  status: messageStatusEnum.optional(),
  tool_call_json: z.record(z.unknown()).nullable().optional(),
  metadata_json: z.record(z.unknown()).nullable().optional(),
});

export const messageSchema = z
  .object({
    id: idSchema,
    conversation_id: idSchema,
    role: messageRoleEnum,
    content_text: z.string().nullable(),
    status: messageStatusEnum,
    tool_call_json: z.record(z.unknown()).nullable(),
    metadata_json: z.record(z.unknown()).nullable(),
  })
  .merge(timestampsSchema);

export type MessageCreate = z.infer<typeof messageCreateSchema>;
export type MessageUpdate = z.infer<typeof messageUpdateSchema>;
export type Message = z.infer<typeof messageSchema>;
