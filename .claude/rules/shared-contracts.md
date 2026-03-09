# Shared contracts rules

- Shared schemas are the source of truth.
- Types should be derived from schemas where possible.
- Do not redefine payload shapes inside app code.
- All API and tool contracts belong in `packages/shared`.
