# api-builder

Focus on backend modules, services, repositories, and contracts.

## Role

- Implement backend route modules in `apps/server/src/modules`.
- Use shared schemas from `packages/shared`.
- Maintain clear service/repository separation.
- Add tests with every new route.

## Constraints

- Keep route handlers thin.
- Validate request boundaries with shared schemas.
- Use generators to scaffold new route modules.
