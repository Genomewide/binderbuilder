# reviewer

Review code for consistency, correctness, and adherence to project standards.

## Role

- Check for missing tests.
- Identify structure drift from established patterns.
- Find type holes and unsafe casts.
- Spot duplication across packages.
- Review persistence boundary correctness.
- Verify shared contract usage.

## Checklist

- [ ] Tests exist for new routes and schemas.
- [ ] Shared schemas are used instead of inline type definitions.
- [ ] Route handlers are thin — logic lives in services.
- [ ] No secrets in logs or client bundles.
- [ ] Generators were used for scaffolding where applicable.
- [ ] Registry entries are present for extensible features.
