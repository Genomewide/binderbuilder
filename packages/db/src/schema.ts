import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`);

const updatedAt = () =>
  text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`);

// ── Tables ──────────────────────────────────────────────

export const workspaces = sqliteTable("workspaces", {
  id: id(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const conversations = sqliteTable("conversations", {
  id: id(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  providerKey: text("provider_key"),
  modelKey: text("model_key"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const messages = sqliteTable("messages", {
  id: id(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["system", "user", "assistant", "tool"] }).notNull(),
  contentText: text("content_text"),
  status: text("status", {
    enum: ["pending", "streaming", "complete", "error", "cancelled"],
  })
    .notNull()
    .default("complete"),
  toolCallJson: text("tool_call_json"),
  metadataJson: text("metadata_json"),
  createdAt: createdAt(),
});

export const artifacts = sqliteTable("artifacts", {
  id: id(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),
  kind: text("kind", {
    enum: ["code", "document", "image", "spreadsheet", "diagram", "other"],
  }).notNull(),
  title: text("title").notNull(),
  mimeType: text("mime_type"),
  diskPath: text("disk_path"),
  metadataJson: text("metadata_json"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const files = sqliteTable("files", {
  id: id(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  diskPath: text("disk_path").notNull(),
  metadataJson: text("metadata_json"),
  createdAt: createdAt(),
});

export const jobs = sqliteTable("jobs", {
  id: id(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  status: text("status", {
    enum: ["queued", "running", "complete", "failed", "cancelled"],
  })
    .notNull()
    .default("queued"),
  progress: real("progress").default(0),
  payloadJson: text("payload_json"),
  resultJson: text("result_json"),
  errorText: text("error_text"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull(),
  updatedAt: updatedAt(),
});

export const mcpServers = sqliteTable("mcp_servers", {
  id: id(),
  name: text("name").notNull(),
  kind: text("kind", { enum: ["stdio", "streamable-http", "custom"] }).notNull(),
  connectionJson: text("connection_json").notNull(),
  status: text("status", { enum: ["active", "inactive", "error"] })
    .notNull()
    .default("inactive"),
  lastSeenAt: text("last_seen_at"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const mcpTools = sqliteTable("mcp_tools", {
  id: id(),
  mcpServerId: text("mcp_server_id")
    .notNull()
    .references(() => mcpServers.id, { onDelete: "cascade" }),
  toolName: text("tool_name").notNull(),
  title: text("title"),
  description: text("description"),
  inputSchemaJson: text("input_schema_json"),
  outputSchemaJson: text("output_schema_json"),
  metadataJson: text("metadata_json"),
  updatedAt: updatedAt(),
});

export const skills = sqliteTable("skills", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  source: text("source", { enum: ["builtin", "community", "custom"] })
    .notNull()
    .default("custom"),
  metadataJson: text("metadata_json"),
  updatedAt: updatedAt(),
});

export const activityLog = sqliteTable("activity_log", {
  id: id(),
  workspaceId: text("workspace_id"),
  kind: text("kind").notNull(),
  actor: text("actor"),
  summary: text("summary"),
  payloadJson: text("payload_json"),
  createdAt: createdAt(),
});
