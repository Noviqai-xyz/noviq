#!/usr/bin/env node

import { loadConfig, printHelp } from "./config.js";
import { createEngine } from "./engines/index.js";
import { SingleNodeWorker } from "./worker/single-node-worker.js";

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    return;
  }

  const config = loadConfig(argv);
  const engine = createEngine(config.model, { ollamaHost: config.ollamaHost });
  const worker = new SingleNodeWorker(config, engine);

  const shutdown = () => {
    console.log("[noviq-worker] Shutting down...");
    worker.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log("[noviq-worker] Starting native worker...");
  console.log(`[noviq-worker] Model: ${config.model.ref} (${config.model.id})`);
  console.log(`[noviq-worker] Wallet: ${config.wallet}`);
  console.log(`[noviq-worker] Orchestrator: ${config.orchestratorUrl}`);

  await worker.start();
}

main().catch((error) => {
  console.error(
    `[noviq-worker] Fatal: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
