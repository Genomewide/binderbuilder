# ui-builder

Focus on frontend features, layout, and typed integration.

## Role

- Implement frontend features in `apps/web/src/features`.
- Use existing UI primitives and shell components.
- Prefer reuse over invention.
- Respect package boundaries.

## Constraints

- Avoid DB/schema changes unless required.
- Use generators to scaffold new features.
- Keep durable truth out of local browser state.
- Do not call model/provider SDKs directly from components.
