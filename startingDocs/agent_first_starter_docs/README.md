# Agent-First React + Node Starter Doc Set

This document set is meant to be handed to Claude Code to create a reusable starter repository for:

- React + TypeScript frontend
- Node backend
- Local-first durable storage on the server hard drive
- LLM chat
- MCP integration
- Claude skills
- Stable reload-safe state
- Agent-friendly conventions

## Included documents

1. `01-architecture-overview.md`
2. `02-repo-file-tree.md`
3. `03-package-contracts.md`
4. `04-state-and-data-architecture.md`
5. `05-chat-mcp-skills-architecture.md`
6. `06-claude-code-repo-rules.md`
7. `07-generators-spec.md`
8. `08-database-schema-starter.md`
9. `09-testing-and-quality-gates.md`
10. `10-phased-implementation-plan.md`
11. `11-claude-code-implementation-prompt.md`

## Intended use

Give the full set to Claude Code and instruct it to:

- read all docs first
- make an implementation plan
- build the starter repo
- continue until the repo is runnable and testable
- stop only when the UI can be tested

## Design intent

This repo is optimized for **LLM maintainability**, not only human convenience.

That means:

- constrained structure
- explicit registries
- generators before hand-written scaffolding
- strong shared contracts
- deterministic validation
- path-specific guidance
- hooks and checks instead of relying on memory

