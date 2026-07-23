# noviq-client

Worker software every Noviq contributor runs — native CLI (Ollama) and browser worker (WebLLM).

## Modes

| Mode | Status | Description |
|------|--------|-------------|
| **Single-node** | v1 (now) | Full prompt → local forward pass → stream tokens to orchestrator |
| **Swarm** | v2 (later) | Layer-block pipeline via `noviq-swarm` — see `SwarmWorker` stub |

## Native worker (Ollama)

Requires [Ollama](https://ollama.com) running locally with your model pulled:

```bash
ollama pull qwen2.5:27b
```

Install and run from the monorepo root:

```bash
pnpm install
pnpm --filter noviq-client build

# Development (tsx)
pnpm --filter noviq-client dev -- --wallet 0xYOUR_WALLET --model qwen2.5:27b

# Production binary
pnpm --filter noviq-client start -- --wallet 0xYOUR_WALLET
```

### CLI options

| Flag / env | Default | Description |
|------------|---------|-------------|
| `--wallet` / `NOVIQ_WALLET` | — | Payout wallet (required) |
| `--orchestrator` / `NOVIQ_ORCHESTRATOR_URL` | `wss://orchestrator.noviqai.xyz/v1/worker` | Orchestrator WebSocket |
| `--model` / `NOVIQ_MODEL` | `qwen2.5:27b` | Ollama model ref |
| `--model-id` / `NOVIQ_MODEL_ID` | `noviq-max-27b` | Model id advertised to network |
| `--ollama-host` / `OLLAMA_HOST` | `http://127.0.0.1:11434` | Ollama API base URL |

## Browser worker (WebLLM)

Import from the browser subpath inside `noviqai.xyz`:

```typescript
import { BrowserWorker } from "noviq-client/browser";
```

Wire in a WebLLM engine from [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) via `BrowserWorkerOptions.engine`.

## Orchestrator protocol

WebSocket messages between worker and `noviq-orchestrator`:

**Worker → orchestrator**

- `register` — wallet, GPU specs, model, worker class
- `heartbeat` — liveness
- `job_token` — streamed output token
- `job_complete` — token usage for billing
- `job_error` — failed job

**Orchestrator → worker**

- `registered` — assigned worker id
- `job` — prompt + messages
- `ping` / `pong`

No prompt or response bodies are retained by the client after the job completes.

## Engines

| Engine | Worker | Source |
|--------|--------|--------|
| Ollama | Native | [ollama.com/library](https://ollama.com/library) |
| vLLM | Native (future) | Hugging Face weights + [vLLM](https://github.com/vllm-project/vllm) |
| WebLLM | Browser | [MLC WebLLM](https://github.com/mlc-ai/web-llm) |

## Install command (website copy-paste)

```bash
curl -fsSL https://noviqai.xyz/install.sh | bash -s -- --wallet 0xYOUR_WALLET
```

*(Install script not shipped yet — run via pnpm until the curl installer lands.)*
