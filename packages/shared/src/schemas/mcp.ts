import { z } from "zod";
import { idSchema, timestampsSchema } from "./common.js";

// ── MCP Server ──────────────────────────────────────────────────────────────

export const mcpServerCreateSchema = z.object({
  id: idSchema.optional().default(crypto.randomUUID()),
  name: z.string().min(1).max(255),
  url: z.string().url().max(2000),
  api_key: z.string().max(500).optional(),
  enabled: z.boolean().optional().default(true),
  metadata_json: z.record(z.unknown()).nullable().optional(),
});

export const mcpServerUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  url: z.string().url().max(2000).optional(),
  api_key: z.string().max(500).optional(),
  enabled: z.boolean().optional(),
  metadata_json: z.record(z.unknown()).nullable().optional(),
});

export const mcpServerSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    url: z.string(),
    api_key: z.string().nullable(),
    enabled: z.boolean(),
    metadata_json: z.record(z.unknown()).nullable(),
  })
  .merge(timestampsSchema);

export type McpServerCreate = z.infer<typeof mcpServerCreateSchema>;
export type McpServerUpdate = z.infer<typeof mcpServerUpdateSchema>;
export type McpServer = z.infer<typeof mcpServerSchema>;

// ── MCP Tool ────────────────────────────────────────────────────────────────

export const mcpToolCreateSchema = z.object({
  id: idSchema.optional().default(crypto.randomUUID()),
  server_id: idSchema,
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  input_schema_json: z.record(z.unknown()).nullable().optional(),
  enabled: z.boolean().optional().default(true),
});

export const mcpToolUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  input_schema_json: z.record(z.unknown()).nullable().optional(),
  enabled: z.boolean().optional(),
});

export const mcpToolSchema = z
  .object({
    id: idSchema,
    server_id: idSchema,
    name: z.string(),
    description: z.string().nullable(),
    input_schema_json: z.record(z.unknown()).nullable(),
    enabled: z.boolean(),
  })
  .merge(timestampsSchema);

export type McpToolCreate = z.infer<typeof mcpToolCreateSchema>;
export type McpToolUpdate = z.infer<typeof mcpToolUpdateSchema>;
export type McpTool = z.infer<typeof mcpToolSchema>;
