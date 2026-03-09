# Architecture Overview

## Goal

Build a reusable starter repository for a family of apps that usually share these characteristics:

- React + TypeScript frontend
- Node backend
- data persisted locally on the server hard drive
- LLM chat support
- MCP support
- Claude skill support
- workbench-style UI surfaces
- state that survives browser reloads
- implementation by coding agents

## Core design principles

### 1. Separate state by responsibility

Use four different state layers:

- **UI/workbench state** → Zustand
- **Server state / fetched data** → TanStack Query
- **Durable truth** → SQLite
- **Shareable navigation state** → URL search params / route params

Never collapse all state into a single store.

### 2. Durable truth lives on the server

The browser may persist UI preferences and local workbench state, but durable truth belongs on disk.

Use:

- SQLite for structured metadata
- disk files for large blobs / artifacts / uploads
- DB references to disk paths

### 3. Shared contracts are the spine of the repo

All important boundaries must share typed schemas:

- API request/response
- DB-adjacent DTOs
- chat messages
- MCP tool inputs/outputs
- artifact metadata
- settings
- model/provider config

These schemas live in one place.

### 4. The repo is built for agents

Assume most code is added by LLM coding agents.

That means:

- one obvious location for each concern
- generator-first workflows
- registries for all extension points
- path-scoped rules
- automated checks
- minimal ambiguity

### 5. AI, MCP, and skills are boundaries, not scattered utilities

Create dedicated packages for:

- `ai`
- `mcp`
- `skills`

Do not let UI components directly own provider logic or tool transport logic.

## Recommended stack

### Frontend

- Vite
- React
- TypeScript
- React Router
- Zustand
- TanStack Query
- Zod
- Tailwind CSS
- shadcn/ui or Radix-based components
- React Hook Form

### Backend

- Fastify
- TypeScript
- Zod
- Drizzle
- SQLite
- Pino

### Testing

- Vitest
- Playwright

### Monorepo tooling

- pnpm workspace
- Turbo
- shared TS config
- shared ESLint config

## Repo posture

This is not an “MVP starter.”

It is a **repeatable foundation** that should support many apps over time without becoming brittle.
