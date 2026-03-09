# Frontend rules

- Use existing shell and panel primitives.
- Put domain UI in `apps/web/src/features`.
- Keep durable truth out of local browser state.
- Do not call model/provider SDKs directly from components.
- Prefer typed API hooks.
- Prefer feature-local hooks and components until reuse is justified.
- Do not fetch durable truth directly from random endpoints without typed hooks.
