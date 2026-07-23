import type { WorkerConfig } from "./types.js";

const DEFAULT_ORCHESTRATOR = "wss://orchestrator.noviqai.xyz/v1/worker";
const DEFAULT_OLLAMA_HOST = "http://127.0.0.1:11434";
const DEFAULT_HEARTBEAT_MS = 30_000;

export function loadConfig(argv: string[] = process.argv.slice(2)): WorkerConfig {
  const args = parseArgs(argv);

  const wallet = args.wallet ?? process.env.NOVIQ_WALLET;
  if (!wallet) {
    throw new Error(
      "Wallet address required. Pass --wallet or set NOVIQ_WALLET.",
    );
  }

  const modelRef =
    args.model ?? process.env.NOVIQ_MODEL ?? "qwen2.5:27b";
  const modelId = args["model-id"] ?? process.env.NOVIQ_MODEL_ID ?? "noviq-max-27b";

  return {
    orchestratorUrl:
      args.orchestrator ??
      process.env.NOVIQ_ORCHESTRATOR_URL ??
      DEFAULT_ORCHESTRATOR,
    wallet,
    workerClass: "native",
    executionMode: "single",
    model: {
      id: modelId,
      engine: "ollama",
      ref: modelRef,
    },
    ollamaHost:
      args["ollama-host"] ?? process.env.OLLAMA_HOST ?? DEFAULT_OLLAMA_HOST,
    heartbeatIntervalMs: DEFAULT_HEARTBEAT_MS,
  };
}

function parseArgs(argv: string[]): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      result[key] = "true";
      continue;
    }

    result[key] = next;
    i += 1;
  }

  return result;
}

export function printHelp(): void {
  console.log(`noviq-worker — Noviq AI native inference worker

Usage:
  noviq-worker --wallet <address> [options]

Options:
  --wallet          Payout wallet address (or NOVIQ_WALLET)
  --orchestrator    Orchestrator WebSocket URL (or NOVIQ_ORCHESTRATOR_URL)
  --model           Ollama model ref, e.g. qwen2.5:27b (or NOVIQ_MODEL)
  --model-id        Network model id advertised to orchestrator (or NOVIQ_MODEL_ID)
  --ollama-host     Ollama API base URL (or OLLAMA_HOST)
  --help            Show this help

Example:
  noviq-worker --wallet 0xabc... --model qwen2.5:27b
`);
}
