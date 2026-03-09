# Generators Spec

Generators are central to this starter.

Agents should scaffold through generators instead of inventing structure.

## Required generators

- `pnpm gen:feature`
- `pnpm gen:route`
- `pnpm gen:entity`
- `pnpm gen:panel`
- `pnpm gen:store`
- `pnpm gen:mcp-tool`
- `pnpm gen:skill`
- `pnpm gen:example`

## Generator standards

Every generator should:

- place files in canonical locations
- update registry/exports automatically
- create at least basic tests
- create a README or inline usage note if needed
- avoid placeholder junk that agents will forget to finish
- produce typed files wired to shared contracts where applicable

## `gen:feature`

### Inputs
- feature name
- has route? yes/no
- needs store? yes/no
- needs server module? yes/no
- needs chat integration? yes/no

### Output
- `apps/web/src/features/<feature>/`
- components folder
- hooks folder
- feature entry file
- route/page when requested
- client API hook stub if server integration is requested
- basic test
- registry entry if relevant

## `gen:route`

### Inputs
- route name
- REST-style resource or custom endpoint
- method(s)
- response schema name
- request schema name if relevant

### Output
- server module files:
  - `routes.ts`
  - `service.ts`
  - `repository.ts`
  - `schemas.ts`
  - tests
- shared contracts if needed
- route registry wiring

## `gen:entity`

### Inputs
- entity name
- include CRUD routes? yes/no
- include DB table? yes/no
- include frontend list/detail/edit pages? yes/no

### Output
- shared schema
- DB schema starter
- repository starter
- route module
- frontend feature views if selected
- tests
- registry entries

## `gen:panel`

### Inputs
- panel name
- dock target: left/right/bottom/main
- needs persisted UI state? yes/no

### Output
- panel component
- panel registration
- optional UI slice wiring
- test

## `gen:store`

### Inputs
- store name
- persist? yes/no
- URL sync? yes/no

### Output
- Zustand store factory usage
- slice file
- migration stub if persisted
- tests for defaults if practical

## `gen:mcp-tool`

### Inputs
- tool name
- local or remote
- input schema name
- output schema name
- include UI metadata inspector? yes/no

### Output
- shared schemas
- MCP tool implementation file
- tool registry update
- server-side invocation wrapper
- tests
- optional UI metadata/result card files

## `gen:skill`

### Inputs
- skill name
- category
- include examples? yes/no
- include templates? yes/no

### Output
- `.claude/skills/<skill>/SKILL.md`
- examples folder if requested
- templates/checklists if requested
- skills registry metadata if app-visible

## `gen:example`

### Inputs
- example name
- example type (`chat-basic`, `chat-with-mcp`, `dashboard-crud`, custom)

### Output
- example folder
- example-specific seed data or fixtures
- run instructions
- smoke test if practical

## Suggested scripts block

```json
{
  "scripts": {
    "gen:feature": "tsx scripts/gen-feature.ts",
    "gen:route": "tsx scripts/gen-route.ts",
    "gen:entity": "tsx scripts/gen-entity.ts",
    "gen:panel": "tsx scripts/gen-panel.ts",
    "gen:store": "tsx scripts/gen-store.ts",
    "gen:mcp-tool": "tsx scripts/gen-mcp-tool.ts",
    "gen:skill": "tsx scripts/gen-skill.ts",
    "gen:example": "tsx scripts/gen-example.ts"
  }
}
```
