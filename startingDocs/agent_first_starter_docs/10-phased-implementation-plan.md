# Phased Implementation Plan

## Phase 1 — Workspace foundation

Create:

- pnpm workspace
- Turbo config
- apps/web
- apps/server
- packages/shared
- packages/config
- TS base config
- lint/typecheck/build/test commands
- README and basic docs

### Success criteria
- repo installs
- web and server dev commands run
- baseline build passes

## Phase 2 — Durable storage and shared contracts

Create:

- packages/db
- SQLite and Drizzle setup
- runtime directory bootstrap
- initial schema and migrations
- core shared schemas

### Success criteria
- DB initializes locally
- runtime directories are auto-created
- shared contracts compile cleanly

## Phase 3 — UI shell and state

Create:

- packages/state
- packages/ui shell primitives
- Zustand persisted slices
- TanStack Query setup
- app shell with resizable workbench layout

### Success criteria
- UI loads with shell layout
- layout state persists across reload
- route + URL state pattern is working

## Phase 4 — Core app modules

Create:

- workspaces module
- conversations/messages module
- files module
- artifacts module
- settings module

### Success criteria
- can create workspace
- can create/open conversation
- can list persisted data
- can save and reopen app state cleanly

## Phase 5 — Chat platform

Create:

- packages/ai
- provider abstraction
- streaming chat endpoint
- frontend chat surface
- persisted conversation history

### Success criteria
- can send a message
- can stream response
- final message persists on server

## Phase 6 — MCP platform

Create:

- packages/mcp
- transport adapter layer
- MCP server registry
- tool/resource discovery
- invocation history
- UI browser for MCP tools/resources

### Success criteria
- can register MCP connection
- can discover tools
- can call tool through abstraction
- tool result is inspectable

## Phase 7 — Skills and agent optimization

Create:

- `.claude/CLAUDE.md`
- `.claude/rules/*`
- `.claude/agents/*`
- `.claude/skills/*`
- generators and templates

### Success criteria
- agent instructions are repo-local
- generator scripts work
- extension points are explicit

## Phase 8 — Example apps and hardening

Create:

- chat-basic example
- chat-with-mcp example
- dashboard-crud example
- Playwright smoke tests
- audit logging
- better docs and ADRs

### Success criteria
- examples are runnable
- smoke tests pass
- starter is usable as a base for future projects
