# Testing and Quality Gates

## Required commands

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`
- `pnpm check`

## `pnpm check`

This should run:

1. formatting check
2. lint
3. typecheck
4. unit/integration tests
5. build

## Minimum expectations

### Frontend
Each new feature should have at least:

- a render/smoke test
- one core interaction test if it has meaningful behavior

### Backend
Each new route group should have:

- happy path request/response test
- validation failure test
- service or repository test where logic exists

### Persistence
Schema changes should include:

- migration validation
- repository-level tests if behavior changes

### Chat / AI
Chat-related code should include:

- streaming fixture tests
- message normalization tests
- provider abstraction tests where practical

### MCP
MCP-related code should include:

- schema tests
- registry tests
- invocation wrapper tests
- mock transport tests when useful

### End-to-end
Playwright smoke coverage should include:

- app boots
- workspace loads
- conversation can open
- chat can submit
- reload preserves intended local UI state
- artifact or detail panel can open

## Acceptance policy

Claude Code should not consider work complete until the applicable quality gates pass.

## Additional recommendation

Add a `reviewer` pass that checks:

- wrong file placement
- schema duplication
- persistence boundary mistakes
- missing registrations
- missing tests
- imports that bypass intended boundaries
