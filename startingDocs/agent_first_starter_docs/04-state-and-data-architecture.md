# State and Data Architecture

## State split

### 1. UI state → Zustand

Use Zustand for:

- panel layout
- selected workspace / conversation
- local draft input
- UI preferences
- active tabs
- open/closed inspectors
- workbench selections

### Persist only what matters

Persist:

- layout
- theme / visual preferences
- last selected workspace
- recoverable drafts when useful

Do not persist:

- large fetched collections
- primary chat history
- model outputs as durable truth
- anything that belongs in SQLite

## 2. Server state → TanStack Query

Use TanStack Query for:

- conversations
- message lists
- file lists
- artifact lists
- MCP server metadata
- settings fetched from the API
- job status

Benefits:

- caching
- invalidation
- optimistic updates where useful
- request lifecycle handling

## 3. Durable truth → SQLite

Use SQLite for:

- workspaces
- conversations
- messages
- artifacts
- files
- jobs
- settings
- mcp server metadata
- tool discovery cache
- skill metadata
- activity logs

## 4. Shareable state → URL

Use the URL for:

- workspace ID
- conversation ID
- active tab
- filters
- selected entity ID
- deep-linkable views

## Conceptual data model

### Workspace
A top-level durable grouping for related data.

### Conversation
Belongs to a workspace and has messages.

### Message
Belongs to a conversation, may contain metadata, tool call info, attachments, and artifact links.

### Artifact
A generated or imported durable result. May point to disk.

### File
Metadata about uploaded or managed files.

### Job
Tracks server-side task progress and history.

### McpServer
Configured server reference.

### McpTool
Discovered tool metadata.

### Skill
Repo-defined or app-defined skill metadata.

## Example table set

- `workspaces`
- `conversations`
- `messages`
- `artifacts`
- `files`
- `jobs`
- `settings`
- `mcp_servers`
- `mcp_tools`
- `skills`
- `activity_log`

## File storage model

### Use DB for metadata
Store:

- ids
- display names
- mime types
- file sizes
- creation timestamps
- file path references
- owners / workspace IDs
- derived metadata

### Use disk for large payloads
Store on disk:

- uploads
- exports
- generated docs
- temporary transformed files
- images
- logs
- cached artifacts

## Centralized path policy

All disk access should go through one package utility.

### Bad
Ad hoc `path.join` scattered throughout feature modules.

### Good
A central resolver like:

- `getRuntimePath()`
- `getArtifactsPath()`
- `getWorkspaceFilePath(workspaceId, fileId)`

This is especially important when agents generate code.
