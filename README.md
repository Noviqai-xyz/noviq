# Noviq AI

Inference network powered by contributed compute - [noviqai.xyz](https://noviqai.xyz)

| Package | Domain / role | Purpose |
|---------|---------------|---------|
| `noviq-website` | [noviqai.xyz](https://noviqai.xyz) | Landing page + app (`/earn`, staking, API) |
| `noviq-data` | [data.noviqai.xyz](https://data.noviqai.xyz) | Public network data and analytics |
| `@noviq/worker` | CLI / browser library (npm) | Contributor worker (Ollama native, WebLLM browser) |
| `@noviq/orchestrator` | [orchestrator.noviqai.xyz](https://orchestrator.noviqai.xyz) | Worker control plane: WebSocket, worker tokens, job dispatch + metering (Supabase) |

## Development

```bash
pnpm install

# Main site
pnpm --filter noviq-website dev

# Data dashboard
pnpm --filter noviq-data dev

# Orchestrator (worker control plane; needs Supabase + Privy env - see orchestrator/.env.example)
pnpm --filter @noviq/orchestrator dev

# Native worker (requires a worker token from /earn + Ollama)
pnpm --filter @noviq/worker dev -- --token YOUR_TOKEN --model qwen2.5:27b --pull
```

## Build

```bash
pnpm --filter noviq-website build
pnpm --filter noviq-data build
pnpm --filter @noviq/worker build
```
