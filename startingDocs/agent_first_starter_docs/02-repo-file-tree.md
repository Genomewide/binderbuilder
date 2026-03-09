# Repo File Tree

## Top-level structure

```txt
repo/
├─ apps/
│  ├─ web/
│  └─ server/
├─ packages/
│  ├─ shared/
│  ├─ db/
│  ├─ state/
│  ├─ ui/
│  ├─ ai/
│  ├─ mcp/
│  ├─ skills/
│  ├─ agent/
│  ├─ config/
│  └─ test-utils/
├─ templates/
│  ├─ feature/
│  ├─ route/
│  ├─ entity/
│  ├─ mcp-tool/
│  ├─ skill/
│  └─ panel/
├─ scripts/
├─ docs/
│  ├─ adr/
│  ├─ patterns/
│  ├─ recipes/
│  └─ examples/
├─ examples/
│  ├─ chat-basic/
│  ├─ chat-with-mcp/
│  └─ dashboard-crud/
├─ runtime/
│  ├─ data/
│  ├─ artifacts/
│  └─ logs/
├─ .claude/
│  ├─ CLAUDE.md
│  ├─ settings.json
│  ├─ rules/
│  ├─ agents/
│  └─ skills/
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
├─ tsconfig.base.json
├─ .gitignore
└─ README.md
```

## `apps/web`

```txt
apps/web/
├─ src/
│  ├─ app/
│  │  ├─ bootstrap/
│  │  ├─ providers/
│  │  ├─ router/
│  │  └─ layouts/
│  ├─ features/
│  │  ├─ chat/
│  │  ├─ workspaces/
│  │  ├─ artifacts/
│  │  ├─ files/
│  │  ├─ mcp/
│  │  ├─ skills/
│  │  └─ settings/
│  ├─ pages/
│  ├─ panels/
│  ├─ hooks/
│  ├─ lib/
│  ├─ styles/
│  └─ main.tsx
├─ public/
└─ vite.config.ts
```

## `apps/server`

```txt
apps/server/
├─ src/
│  ├─ app/
│  │  ├─ plugins/
│  │  ├─ routes/
│  │  ├─ middleware/
│  │  └─ server.ts
│  ├─ modules/
│  │  ├─ chat/
│  │  ├─ workspaces/
│  │  ├─ artifacts/
│  │  ├─ files/
│  │  ├─ mcp/
│  │  └─ skills/
│  ├─ lib/
│  └─ index.ts
└─ fastify.config.ts
```

## `packages`

### `shared`
Contracts only.

### `db`
Schema, migrations, repositories.

### `state`
Zustand store utilities and persistence helpers.

### `ui`
Reusable components, shells, layouts, chat primitives.

### `ai`
Provider adapters, streaming interfaces, message normalization.

### `mcp`
Transport adapters, client/server wrappers, tool/resource registries.

### `skills`
Skill packaging, registry, metadata.

### `agent`
Internal agent helpers, plan schemas, prompt builders.

### `config`
TS, ESLint, Vitest, Tailwind shared config.

### `test-utils`
Fixtures, factories, fake streams, DB test helpers.

## `runtime`

```txt
runtime/
├─ data/
│  ├─ app.db
│  └─ uploads/
├─ artifacts/
│  ├─ generated/
│  ├─ exports/
│  └─ temp/
└─ logs/
   ├─ server.log
   └─ audit.log
```

Rules:

- `runtime/` is gitignored
- app creates missing runtime folders at startup
- all disk path access goes through centralized path helpers
