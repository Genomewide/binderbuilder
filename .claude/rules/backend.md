# Backend rules

- Each route group should have `routes.ts`, `service.ts`, `repository.ts`, `schemas.ts`, and tests.
- Validate request boundaries with shared schemas.
- Use centralized runtime path helpers for disk access.
- Keep route handlers thin — business logic belongs in services.
- Do not let route handlers contain business logic that belongs in services.
