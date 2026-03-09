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

## Generators

Use `pnpm gen:<type>` to scaffold new code:

- `pnpm gen:feature <name>` — frontend feature module
- `pnpm gen:route <name>` — backend route module
- `pnpm gen:entity <name>` — full-stack entity (feature + route + shared schema)
- `pnpm gen:store <name>` — Zustand persisted store

## Key paths

| Area | Path |
|------|------|
| Web app | `apps/web/src/` |
| Server | `apps/server/src/` |
| Shared schemas | `packages/shared/src/schemas/` |
| State stores | `packages/state/src/` |
| Claude rules | `.claude/rules/` |
| Claude agents | `.claude/agents/` |
| Claude skills | `.claude/skills/` |
| Generator scripts | `scripts/` |
