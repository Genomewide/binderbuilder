# Database Schema Starter

This is a conceptual starter schema, not the final implementation.

Use Drizzle with SQLite.

## Core tables

### `workspaces`

Suggested columns:

- `id`
- `name`
- `description`
- `created_at`
- `updated_at`

### `conversations`

Suggested columns:

- `id`
- `workspace_id`
- `title`
- `provider_key`
- `model_key`
- `created_at`
- `updated_at`

### `messages`

Suggested columns:

- `id`
- `conversation_id`
- `role`
- `content_text`
- `status`
- `tool_call_json`
- `metadata_json`
- `created_at`

### `artifacts`

Suggested columns:

- `id`
- `workspace_id`
- `conversation_id` nullable
- `kind`
- `title`
- `mime_type`
- `disk_path`
- `metadata_json`
- `created_at`
- `updated_at`

### `files`

Suggested columns:

- `id`
- `workspace_id`
- `display_name`
- `original_name`
- `mime_type`
- `size_bytes`
- `disk_path`
- `metadata_json`
- `created_at`

### `jobs`

Suggested columns:

- `id`
- `workspace_id`
- `kind`
- `status`
- `progress`
- `payload_json`
- `result_json`
- `error_text`
- `created_at`
- `updated_at`

### `settings`

Suggested columns:

- `key`
- `value_json`
- `updated_at`

### `mcp_servers`

Suggested columns:

- `id`
- `name`
- `kind`
- `connection_json`
- `status`
- `last_seen_at`
- `created_at`
- `updated_at`

### `mcp_tools`

Suggested columns:

- `id`
- `mcp_server_id`
- `tool_name`
- `title`
- `description`
- `input_schema_json`
- `output_schema_json`
- `metadata_json`
- `updated_at`

### `skills`

Suggested columns:

- `id`
- `name`
- `slug`
- `source`
- `metadata_json`
- `updated_at`

### `activity_log`

Suggested columns:

- `id`
- `workspace_id` nullable
- `kind`
- `actor`
- `summary`
- `payload_json`
- `created_at`

## Relationships

- workspace has many conversations
- workspace has many artifacts
- workspace has many files
- conversation has many messages
- mcp server has many mcp tools

## Persistence rules

- large content files belong on disk
- DB stores references and metadata
- migrations are required for schema changes
- repositories should wrap DB operations instead of scattering queries across the codebase
