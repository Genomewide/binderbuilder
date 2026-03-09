# Claude Code Implementation Prompt

Use this prompt with Claude Code after providing the full document set.

---

You are implementing a reusable **agent-first starter repository** for a family of local-first apps.

Read **all documents in this doc set first** before making structural decisions.

## Main goal

Build a reusable starter repo with:

- React + TypeScript frontend
- Node backend
- local durable storage on the server hard drive
- SQLite for structured durable truth
- Zustand for persisted UI/workbench state
- TanStack Query for server state
- shared Zod contracts
- LLM chat support through a provider abstraction
- MCP integration through a transport abstraction
- Claude skills support
- strong support for future implementation by coding agents

## Important behavior expectations

- Do not improvise a different architecture if the documents already define the pattern.
- Prefer generators/templates and explicit registries over ad hoc structure.
- Do not add another general-purpose state manager.
- Do not duplicate shared contracts outside `packages/shared`.
- Do not place durable truth in browser persistence.
- Do not let UI components call provider SDKs directly.
- Do not let route handlers absorb business logic that belongs in services/repositories.
- Keep all filesystem path handling centralized.
- Add tests as features and modules are created.

## Work style

1. Read the entire document set.
2. Produce a concrete implementation plan.
3. Create the repo structure.
4. Implement phase by phase.
5. Keep the repo runnable throughout.
6. Run checks regularly.
7. Continue until the starter is testable in the UI.

## Required deliverables

At minimum, create:

- monorepo workspace
- web app
- server app
- shared contracts package
- DB package
- state package
- UI package
- AI package
- MCP package
- skills package
- `.claude` rules / agents / starter skills
- generators for the major scaffold types
- example apps or example surfaces
- tests
- clear run instructions

## Acceptance criteria

The work is complete when:

- `pnpm install` works
- dev mode works for web and server
- build passes
- lint/typecheck/tests pass
- starter UI loads
- a workspace can be created
- a conversation can be created and persisted
- layout state survives reload
- the MCP abstraction exists and is wired
- the repo conventions are documented and usable by future coding agents

## Final instruction

Do not stop at a partial scaffold if the repo is still not actually usable.

Keep going until the foundation is implemented enough that a human can open the UI and begin testing the starter as a real base for future apps.

---
