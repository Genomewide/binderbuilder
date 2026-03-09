import { buildServer } from "./app/server.js";

const PORT = Number(process.env.PORT) || 3100;

async function main() {
  const server = await buildServer();

  try {
    await server.listen({ port: PORT, host: "0.0.0.0" });
    server.log.info(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
