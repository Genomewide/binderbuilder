# Claude Code Repo Rules

This file is the source material for `.claude/CLAUDE.md`, `.claude/rules/*`, `.claude/agents/*`, and hooks.

## Project-wide summary rules

Use these as the backbone of `CLAUDE.md`.

```md
# Repository rules

- Read the architecture docs before making structural changes.
- Use generators before manually creating a new feature, panel, route, or MCP tool.
- Shared schemas belong in `packages/shared`.
- Durable truth belongs in SQLite and disk-backed runtime storage, not browser persistence.
- UI state belongs in Zustand persisted slices only when necessary.
- Server state belongs in TanStack Query.
- Do not add another general-purpose state library.
- Do not duplicate API or tool contracts outside `packages/shared`.
- New routes require tests.
- New extensible features must be registered in the correct registry.
- Run `pnpm check` before concluding work.
```

## Path-scoped rules

### `frontend.md`

- Use existing shell and layout primitives.
- Put new domain-specific UI under `apps/web/src/features`.
- Prefer feature-local hooks and components until reuse is justified.
- Do not call provider SDKs directly from components.
- Do not fetch durable truth directly from random endpoints without typed hooks.

### `backend.md`

- Each route group lives in a module with `routes.ts`, `service.ts`, `repository.ts`, `schemas.ts`, and tests.
- Validate all request boundaries with shared schemas.
- Use centralized runtime path helpers for disk access.
- Do not let route handlers contain business logic that belongs in services.

### `shared-contracts.md`

- Shared schemas are the source of truth.
- Types should be derived from schemas where possible.
- Do not redefine payload shapes inside app code.

### `database.md`

- Durable structured data belongs in SQLite.
- Migrations are required for schema changes.
- Repositories own persistence details.
- Keep DB schema focused on app truth, not transient UI state.

### `mcp.md`

- Use the transport abstraction.
- Every MCP tool must have typed input/output schemas.
- Register new tools in the tool registry.
- Keep connection and credential logic isolated.

### `testing.md`

- New routes require tests.
- New shared schemas may need validation tests.
- New UI features should get at least a smoke interaction test.
- Playwright smoke coverage should stay green.

### `security.md`

- Never expose secrets in logs.
- Avoid unrestricted filesystem access.
- Keep writes inside approved runtime paths.
- Validate any external or tool-sourced payload before trusting it.

## Project agents

### `explore.md`

Role:
- read-only repo explorer
- identify patterns before implementation

### `ui-builder.md`

Role:
- implement frontend features
- use existing UI primitives and shell components
- avoid DB changes unless required

### `api-builder.md`

Role:
- implement backend modules and contracts
- prefer clear service/repository separation

### `mcp-builder.md`

Role:
- implement MCP-related modules
- use transport abstractions and registries
- add tests for tool schemas and invocation behavior

### `reviewer.md`

Role:
- consistency, missing tests, structure drift, type holes, duplication, persistence boundary review

## Hooks policy

### Pre-edit / pre-tool
- block writes to protected generated files unless explicitly allowed
- block reads of `.env` unless needed
- block writes outside repo/runtime paths

### Post-edit
- after TS edits, run targeted formatting
- after route or schema changes, run related tests
- after DB schema changes, require migration generation or validation

### Instructions loaded
- remind the agent to use generators first
- remind the agent to respect registries and package boundaries

## Minimal `.claude/settings.json` ideas

- allow safe local commands
- deny dangerous file operations by default
- define hooks for edits, test runs, and config changes
- set project-scoped permissions instead of wide-open behavior
