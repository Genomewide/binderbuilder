# Repository rules

- Use generators before manually creating a new feature, panel, route, or MCP tool.
- Shared schemas belong in `packages/shared`.
- Durable truth belongs in SQLite and runtime storage, not browser persistence.
- UI state belongs in Zustand persisted slices only when necessary.
- Server state belongs in TanStack Query.
- Do not add another general-purpose state manager.
- Do not duplicate payload contracts outside `packages/shared`.
- New routes require tests.
- New extensible features must be registered in the correct registry.
- Run `pnpm check` before concluding work.
