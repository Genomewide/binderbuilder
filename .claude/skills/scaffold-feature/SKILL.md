# Scaffold Feature

Use this skill when adding a new feature module.

## When to use

- Adding a new domain feature to the application.
- Creating a full-stack entity with frontend, backend, and shared schema.

## Checklist

1. Run `pnpm gen:feature <name>` to create the canonical feature folder.
2. Add typed hooks or API client wiring if the feature needs server integration.
3. Add tests for components and hooks.
4. Register any required panels or routes in the appropriate registry.
5. Reuse existing shell primitives — do not reinvent layout components.
6. If the feature needs a backend module, also run `pnpm gen:route <name>`.
7. If the feature needs a shared schema, also run `pnpm gen:entity <name>`.

## Output structure

```
apps/web/src/features/<name>/
  index.ts
  <Name>.tsx
  hooks.ts
  <Name>.test.tsx
```
