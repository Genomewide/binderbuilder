# Chat, MCP, and Skills Architecture

## Chat architecture

Treat chat as a reusable platform surface, not an app-specific widget.

### Chat domain elements

- conversations
- messages
- provider/model selection
- streaming
- tool calls
- attachments
- artifacts linked to messages
- run status
- retries
- usage metadata

### Frontend chat components

```txt
packages/ui/src/chat/
├─ ChatThread.tsx
├─ MessageList.tsx
├─ MessageBubble.tsx
├─ Composer.tsx
├─ ToolCallCard.tsx
├─ ArtifactCard.tsx
├─ ModelSelector.tsx
└─ StreamingStatus.tsx
```

### Backend chat modules

```txt
packages/ai/src/
├─ providers/
├─ streaming/
├─ sessions/
├─ prompts/
├─ tools/
└─ schemas/
```

### Chat rules

- conversations persist server-side
- messages are durable
- streamed partials may be transient in the client but final results are saved on the server
- provider-specific shapes are normalized

## MCP architecture

## Goals

- support local and remote MCP servers
- isolate transport logic
- make discovery/invocation auditable
- allow UI inspection of tools and resources
- avoid hardwiring one transport assumption

### Package structure

```txt
packages/mcp/src/
├─ client/
├─ server/
├─ transport/
├─ registry/
├─ sessions/
├─ schemas/
└─ utils/
```

### Transport abstraction

Use an interface like:

```ts
export interface McpTransportAdapter {
  kind: 'stdio' | 'streamable-http' | 'custom';
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  listTools(): Promise<unknown[]>;
  listResources(): Promise<unknown[]>;
  callTool(input: unknown): Promise<unknown>;
}
```

### MCP UI surfaces

- server list
- tool browser
- resource browser
- invocation history
- result inspector
- favorites or pinned tools

### MCP rules

- every tool definition gets typed input/output schemas
- invocations should be logged
- tool discovery should be cacheable
- credentials and connection config should be isolated

## Skills architecture

Treat skills as versioned assets.

### Repo skill layout

```txt
.claude/skills/
├─ scaffold-feature/
│  ├─ SKILL.md
│  ├─ examples/
│  └─ templates/
├─ add-mcp-tool/
│  ├─ SKILL.md
│  └─ examples/
└─ harden-route/
   ├─ SKILL.md
   └─ checklists/
```

### App-facing skills package

```txt
packages/skills/src/
├─ registry/
├─ loader/
├─ schemas/
└─ examples/
```

### Recommended starter skills

- scaffold feature
- scaffold route module
- scaffold MCP tool
- scaffold dashboard CRUD entity
- add chat-enabled panel
- harden validation
- create tests for new module
- review persistence boundaries
