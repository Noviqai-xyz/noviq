import cors from "@fastify/cors";
import Fastify from "fastify";
import { env } from "./env.js";
import { registerRoutes } from "./http/routes.js";
import { attachWorkerWs, resetStaleWorkers } from "./ws/server.js";

async function main() {
  const app = Fastify({
    logger: { level: env.isProd ? "info" : "debug" },
  });

  await app.register(cors, {
    origin: env.allowedOrigins.length ? env.allowedOrigins : true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  registerRoutes(app);

  await app.ready();

  // Reset rows left 'online' by a previous process, then attach the WS server.
  await resetStaleWorkers().catch((err) =>
    app.log.warn({ err }, "resetStaleWorkers failed"),
  );
  attachWorkerWs(app.server);

  await app.listen({ port: env.port, host: "0.0.0.0" });
  app.log.info(
    `orchestrator ready - http :${env.port}  ·  ws :${env.port}/v1/worker`,
  );
}

main().catch((err) => {
  console.error("Fatal orchestrator error:", err);
  process.exit(1);
});
