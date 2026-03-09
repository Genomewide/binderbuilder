import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoute } from "./routes/health.js";
import { initDb } from "../lib/db.js";
import { workspacesRoutes } from "../modules/workspaces/routes.js";
import { conversationsRoutes } from "../modules/conversations/routes.js";
import { messagesRoutes } from "../modules/messages/routes.js";
import { artifactsRoutes } from "../modules/artifacts/routes.js";
import { settingsRoutes } from "../modules/settings/routes.js";
import { chatRoutes } from "../modules/chat/routes.js";
import { mcpRoutes } from "../modules/mcp/routes.js";
import { registerProvider, echoProvider } from "@baseui/ai";

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: "info",
    },
  });

  await server.register(cors, {
    origin: true,
  });

  // Initialize DB (push schema for dev)
  const db = initDb();

  // Register default AI providers
  registerProvider(echoProvider);

  // Routes
  await server.register(healthRoute, { prefix: "/api" });
  await server.register(workspacesRoutes(db), { prefix: "/api" });
  await server.register(conversationsRoutes(db), { prefix: "/api" });
  await server.register(messagesRoutes(db), { prefix: "/api" });
  await server.register(artifactsRoutes(db), { prefix: "/api" });
  await server.register(settingsRoutes(db), { prefix: "/api" });
  await server.register(chatRoutes(db), { prefix: "/api" });
  await server.register(mcpRoutes(), { prefix: "/api" });

  return server;
}
