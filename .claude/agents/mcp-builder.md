# mcp-builder

Focus on MCP-related modules, transport abstractions, and tool registries.

## Role

- Implement MCP tool definitions and handlers.
- Use transport abstractions and registries.
- Add tests for tool schemas and invocation behavior.
- Keep connection and credential logic isolated.

## Constraints

- Every MCP tool must have typed input/output schemas in `packages/shared`.
- Register new tools in the tool registry.
- Use generators to scaffold new MCP tools.
