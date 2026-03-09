import { z } from "zod";
import {
  paginationQuerySchema,
  workspaceCreateSchema,
  workspaceUpdateSchema,
  workspaceSchema,
  conversationCreateSchema,
  conversationUpdateSchema,
  conversationSchema,
  messageCreateSchema,
  messageUpdateSchema,
  messageSchema,
  artifactCreateSchema,
  artifactUpdateSchema,
  artifactSchema,
  fileCreateSchema,
  fileUpdateSchema,
  fileSchema,
  jobCreateSchema,
  jobUpdateSchema,
  jobSchema,
  settingCreateSchema,
  settingUpdateSchema,
  settingSchema,
  mcpServerCreateSchema,
  mcpServerUpdateSchema,
  mcpServerSchema,
  mcpToolCreateSchema,
  mcpToolUpdateSchema,
  mcpToolSchema,
  paginatedResponseSchema,
} from "../schemas/index.js";

// ── Route Contract ──────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RouteContract<
  TMethod extends HttpMethod = HttpMethod,
  TPath extends string = string,
  TQuery extends z.ZodTypeAny = z.ZodTypeAny,
  TBody extends z.ZodTypeAny = z.ZodTypeAny,
  TResponse extends z.ZodTypeAny = z.ZodTypeAny,
> {
  method: TMethod;
  path: TPath;
  query?: TQuery;
  body?: TBody;
  response: TResponse;
}

function route<
  TMethod extends HttpMethod,
  TPath extends string,
  TQuery extends z.ZodTypeAny,
  TBody extends z.ZodTypeAny,
  TResponse extends z.ZodTypeAny,
>(
  contract: RouteContract<TMethod, TPath, TQuery, TBody, TResponse>,
): RouteContract<TMethod, TPath, TQuery, TBody, TResponse> {
  return contract;
}

// ── Workspaces ──────────────────────────────────────────────────────────────

export const workspacesApi = {
  list: route({
    method: "GET",
    path: "/api/workspaces",
    query: paginationQuerySchema,
    response: paginatedResponseSchema(workspaceSchema),
  }),
  get: route({
    method: "GET",
    path: "/api/workspaces/:id",
    response: workspaceSchema,
  }),
  create: route({
    method: "POST",
    path: "/api/workspaces",
    body: workspaceCreateSchema,
    response: workspaceSchema,
  }),
  update: route({
    method: "PATCH",
    path: "/api/workspaces/:id",
    body: workspaceUpdateSchema,
    response: workspaceSchema,
  }),
  delete: route({
    method: "DELETE",
    path: "/api/workspaces/:id",
    response: z.object({ success: z.boolean() }),
  }),
} as const;

// ── Conversations ───────────────────────────────────────────────────────────

export const conversationsApi = {
  list: route({
    method: "GET",
    path: "/api/workspaces/:workspace_id/conversations",
    query: paginationQuerySchema,
    response: paginatedResponseSchema(conversationSchema),
  }),
  get: route({
    method: "GET",
    path: "/api/conversations/:id",
    response: conversationSchema,
  }),
  create: route({
    method: "POST",
    path: "/api/workspaces/:workspace_id/conversations",
    body: conversationCreateSchema,
    response: conversationSchema,
  }),
  update: route({
    method: "PATCH",
    path: "/api/conversations/:id",
    body: conversationUpdateSchema,
    response: conversationSchema,
  }),
  delete: route({
    method: "DELETE",
    path: "/api/conversations/:id",
    response: z.object({ success: z.boolean() }),
  }),
} as const;

// ── Messages ────────────────────────────────────────────────────────────────

export const messagesApi = {
  list: route({
    method: "GET",
    path: "/api/conversations/:conversation_id/messages",
    query: paginationQuerySchema,
    response: paginatedResponseSchema(messageSchema),
  }),
  get: route({
    method: "GET",
    path: "/api/messages/:id",
    response: messageSchema,
  }),
  create: route({
    method: "POST",
    path: "/api/conversations/:conversation_id/messages",
    body: messageCreateSchema,
    response: messageSchema,
  }),
  update: route({
    method: "PATCH",
    path: "/api/messages/:id",
    body: messageUpdateSchema,
    response: messageSchema,
  }),
  delete: route({
    method: "DELETE",
    path: "/api/messages/:id",
    response: z.object({ success: z.boolean() }),
  }),
} as const;

// ── Artifacts ───────────────────────────────────────────────────────────────

export const artifactsApi = {
  list: route({
    method: "GET",
    path: "/api/messages/:message_id/artifacts",
    query: paginationQuerySchema,
    response: paginatedResponseSchema(artifactSchema),
  }),
  get: route({
    method: "GET",
    path: "/api/artifacts/:id",
    response: artifactSchema,
  }),
  create: route({
    method: "POST",
    path: "/api/messages/:message_id/artifacts",
    body: artifactCreateSchema,
    response: artifactSchema,
  }),
  update: route({
    method: "PATCH",
    path: "/api/artifacts/:id",
    body: artifactUpdateSchema,
    response: artifactSchema,
  }),
  delete: route({
    method: "DELETE",
    path: "/api/artifacts/:id",
    response: z.object({ success: z.boolean() }),
  }),
} as const;

// ── Files ───────────────────────────────────────────────────────────────────

export const filesApi = {
  list: route({
    method: "GET",
    path: "/api/workspaces/:workspace_id/files",
    query: paginationQuerySchema,
    response: paginatedResponseSchema(fileSchema),
  }),
  get: route({
    method: "GET",
    path: "/api/files/:id",
    response: fileSchema,
  }),
  create: route({
    method: "POST",
    path: "/api/workspaces/:workspace_id/files",
    body: fileCreateSchema,
    response: fileSchema,
  }),
  update: route({
    method: "PATCH",
    path: "/api/files/:id",
    body: fileUpdateSchema,
    response: fileSchema,
  }),
  delete: route({
    method: "DELETE",
    path: "/api/files/:id",
    response: z.object({ success: z.boolean() }),
  }),
} as const;

// ── Jobs ────────────────────────────────────────────────────────────────────

export const jobsApi = {
  list: route({
    method: "GET",
    path: "/api/workspaces/:workspace_id/jobs",
    query: paginationQuerySchema,
    response: paginatedResponseSchema(jobSchema),
  }),
  get: route({
    method: "GET",
    path: "/api/jobs/:id",
    response: jobSchema,
  }),
  create: route({
    method: "POST",
    path: "/api/workspaces/:workspace_id/jobs",
    body: jobCreateSchema,
    response: jobSchema,
  }),
  update: route({
    method: "PATCH",
    path: "/api/jobs/:id",
    body: jobUpdateSchema,
    response: jobSchema,
  }),
  delete: route({
    method: "DELETE",
    path: "/api/jobs/:id",
    response: z.object({ success: z.boolean() }),
  }),
} as const;

// ── Settings ────────────────────────────────────────────────────────────────

export const settingsApi = {
  list: route({
    method: "GET",
    path: "/api/settings",
    response: z.array(settingSchema),
  }),
  get: route({
    method: "GET",
    path: "/api/settings/:key",
    response: settingSchema,
  }),
  upsert: route({
    method: "PUT",
    path: "/api/settings/:key",
    body: settingUpdateSchema,
    response: settingSchema,
  }),
  delete: route({
    method: "DELETE",
    path: "/api/settings/:key",
    response: z.object({ success: z.boolean() }),
  }),
} as const;

// ── MCP Servers ─────────────────────────────────────────────────────────────

export const mcpServersApi = {
  list: route({
    method: "GET",
    path: "/api/mcp-servers",
    query: paginationQuerySchema,
    response: paginatedResponseSchema(mcpServerSchema),
  }),
  get: route({
    method: "GET",
    path: "/api/mcp-servers/:id",
    response: mcpServerSchema,
  }),
  create: route({
    method: "POST",
    path: "/api/mcp-servers",
    body: mcpServerCreateSchema,
    response: mcpServerSchema,
  }),
  update: route({
    method: "PATCH",
    path: "/api/mcp-servers/:id",
    body: mcpServerUpdateSchema,
    response: mcpServerSchema,
  }),
  delete: route({
    method: "DELETE",
    path: "/api/mcp-servers/:id",
    response: z.object({ success: z.boolean() }),
  }),
} as const;

// ── MCP Tools ───────────────────────────────────────────────────────────────

export const mcpToolsApi = {
  list: route({
    method: "GET",
    path: "/api/mcp-servers/:server_id/tools",
    query: paginationQuerySchema,
    response: paginatedResponseSchema(mcpToolSchema),
  }),
  get: route({
    method: "GET",
    path: "/api/mcp-tools/:id",
    response: mcpToolSchema,
  }),
  create: route({
    method: "POST",
    path: "/api/mcp-servers/:server_id/tools",
    body: mcpToolCreateSchema,
    response: mcpToolSchema,
  }),
  update: route({
    method: "PATCH",
    path: "/api/mcp-tools/:id",
    body: mcpToolUpdateSchema,
    response: mcpToolSchema,
  }),
  delete: route({
    method: "DELETE",
    path: "/api/mcp-tools/:id",
    response: z.object({ success: z.boolean() }),
  }),
} as const;

// ── Aggregate ───────────────────────────────────────────────────────────────

export const apiContracts = {
  workspaces: workspacesApi,
  conversations: conversationsApi,
  messages: messagesApi,
  artifacts: artifactsApi,
  files: filesApi,
  jobs: jobsApi,
  settings: settingsApi,
  mcpServers: mcpServersApi,
  mcpTools: mcpToolsApi,
} as const;

export type ApiContracts = typeof apiContracts;
