# Package Contracts

## `packages/shared`

This is the most important package.

Contains:

- Zod schemas
- DTOs
- domain enums
- shared TS types derived from schemas
- route contracts
- chat schemas
- artifact metadata schemas
- settings schemas
- MCP-related payload schemas

### Must not contain

- React code
- Fastify code
- DB ORM code
- provider SDK implementations

### Suggested structure

```txt
packages/shared/src/
├─ schemas/
│  ├─ common/
│  ├─ settings/
│  ├─ workspaces/
│  ├─ conversations/
│  ├─ messages/
│  ├─ artifacts/
│  ├─ files/
│  ├─ models/
│  ├─ mcp/
│  └─ skills/
├─ contracts/
├─ events/
├─ utils/
└─ index.ts
```

## `packages/db`

Contains:

- Drizzle schema
- migrations
- seed data
- repositories
- runtime path utilities for durable storage
- query helpers

### Rules

- DB tables model durable truth
- large content blobs are stored on disk, not inline in DB if that becomes heavy
- all filesystem references stored as structured metadata

## `packages/state`

Contains:

- `createPersistedStore`
- slice composition utilities
- migration helpers
- storage adapters
- URL sync helpers

### Rules

- only UI / workbench state belongs here
- server-fetched lists do not belong in Zustand unless there is a narrow UX reason
- stores must be versioned when persisted

## `packages/ui`

Contains:

- shell components
- chat components
- inspector and detail components
- split-pane and docking primitives
- tables/forms/cards/dialogs
- theming helpers

### Rules

- no direct DB access
- no provider SDK access
- minimal feature-specific assumptions

## `packages/ai`

Contains:

- provider interfaces
- provider implementations
- model config schemas
- message normalization
- streaming adapters
- tool-call normalization
- retry / error wrappers
- usage metadata helpers

### Rules

- provider logic is isolated here
- UI does not call providers directly
- provider responses are normalized to internal shared schemas

## `packages/mcp`

Contains:

- transport abstraction
- local process manager
- remote MCP client wrappers
- registry of tools/resources
- session management
- invocation helpers
- UI-friendly metadata normalization

### Rules

- no direct UI assumptions
- transport details stay behind adapters
- tool definitions must use schemas from `shared`

## `packages/skills`

Contains:

- repo-defined skill metadata
- skill loader
- registry
- helper functions for skill discovery
- examples

### Rules

- skill metadata should be structured and discoverable
- keep skill docs versionable

## `packages/agent`

Contains:

- task schemas
- plan/checklist schemas
- code-change request schemas
- prompt builders for internal agent workflows
- review/report helpers

## `packages/config`

Contains:

- shared TypeScript config
- shared ESLint config
- Tailwind preset
- Vitest defaults
- common build/lint presets

## `packages/test-utils`

Contains:

- fixture factories
- mocked streamed chat responses
- fake MCP responses
- test DB setup
- helper render wrappers
