# baseUI

Agent-first starter repository for React + Node apps with LLM chat, MCP integration, and workbench-style UI.

## Quick Start

```bash
pnpm install
pnpm dev        # starts web (localhost:5173) + server (localhost:3100)
```

## Stack

- **Frontend:** Vite, React 19, TypeScript, React Router, Zustand, TanStack Query, Tailwind CSS
- **Backend:** Fastify 5, TypeScript, Drizzle, SQLite (better-sqlite3), Pino
- **Testing:** Vitest, Playwright (E2E)
- **Monorepo:** pnpm workspaces, Turbo

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web + server in dev mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run unit/integration tests |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm check` | Run lint + typecheck + test + build |
| `pnpm gen:feature <name>` | Scaffold a frontend feature |
| `pnpm gen:route <name>` | Scaffold a backend route module |
| `pnpm gen:entity <name>` | Scaffold full-stack entity (FE + BE + schema) |
| `pnpm gen:store <name>` | Scaffold a Zustand store |

## Architecture

```
apps/web          → React frontend (Vite)
apps/server       → Fastify API server
packages/shared   → Zod schemas, contracts, types
packages/db       → Drizzle schema, SQLite, runtime paths
packages/state    → Zustand stores, persistence
packages/ui       → Shell components, layout primitives
packages/ai       → AI provider abstraction (echo provider included)
packages/mcp      → MCP transport abstraction, tool registry
packages/skills   → Skill metadata and registry
packages/agent    → Agent task/plan schemas
packages/config   → Shared ESLint, TS, Tailwind, Vitest config
packages/test-utils → Test fixtures and helpers
```

## Features

- Workspace management (create, select, delete)
- Conversation/message CRUD with persistence
- LLM chat with streaming (echo provider for testing)
- MCP server registration, tool discovery, tool invocation
- Resizable workbench layout with persistent state
- Settings management
- Code generators for consistent scaffolding
- Claude Code rules, agents, and skills for AI-assisted development

## Why This Repo Is Good For AI Development

This repository is designed so coding agents can make reliable, incremental changes with less guesswork and fewer regressions.

### 1) Predictable boundaries reduce search and reasoning cost

- Frontend and backend are split into `apps/web` and `apps/server`.
- Shared contracts/types live in `packages/shared`.
- Cross-cutting runtime concerns (db, state, ui primitives, ai, mcp) are isolated in dedicated packages.
- Result: an AI can quickly locate the correct layer and avoid mixing concerns.

### 2) Shared schemas reduce FE/BE drift

- Zod contracts and shared types are centralized instead of duplicated.
- AI-generated changes can be validated against shared schemas before runtime.
- Result: fewer "frontend expects shape A, backend returns shape B" issues.

### 3) Local-first persistence improves reproducibility

- SQLite + Drizzle provide deterministic, local server-side storage.
- Workspace/conversation/message data model is explicit and inspectable.
- Result: AI debugging is easier because state is durable and reproducible between runs.

### 4) Built-in AI extension points are already present

- `packages/ai` provides provider abstraction (with an echo provider for safe local testing).
- `packages/mcp` provides MCP transport abstraction and tool registry.
- Chat and MCP API routes are already wired in the server.
- Result: AI developers can focus on behavior/integrations, not initial plumbing.

### 5) Generator-driven scaffolding improves consistency

- Use `pnpm gen:feature`, `pnpm gen:route`, `pnpm gen:entity`, and `pnpm gen:store`.
- Scaffolding enforces conventions and standard file placement.
- Result: AI output is more consistent and easier to review.

### 6) Built-in quality gates catch weak AI edits early

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` run across workspaces.
- `pnpm check` provides a one-command gate for confidence before merge.
- Result: faster feedback loop and safer autonomous iteration.

### 7) State model supports project-style isolation

- Workspaces separate context while reusing the same UI shell.
- Conversations/messages/artifacts/files/jobs are linked to workspace IDs.
- Result: AI features can be tested in isolated contexts without cross-contamination.

## AI Developer Quickstart (Recommended)

1. Run `pnpm install` then `pnpm dev`.
2. Read this `README.md` for orientation.
3. Read docs in `startingDocs/agent_first_starter_docs/` for architecture, data model, AI/MCP/skills intent, and implementation conventions.
4. Make focused changes that stay within package boundaries.
5. Validate with `pnpm check` before handing off.

## Current AI Feature Maturity (Important)

- **Implemented now:** workspace/conversation/message flows, chat route wiring, MCP server registration + tool browsing/calling, workbench UI shell.
- **Scaffolded but not fully productized:** skills package/schema and related extension points.
- **Implication:** this repo is a strong AI foundation, but some advanced capabilities are intentionally staged for iterative expansion.
