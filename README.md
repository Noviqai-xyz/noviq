# Noviq AI

Inference network powered by contributed compute — [noviqai.xyz](https://noviqai.xyz)

| Package | Domain / role | Purpose |
|---------|---------------|---------|
| `noviq-website` | [noviqai.xyz](https://noviqai.xyz) | Landing page + app (API, browser worker, native worker) |
| `noviq-data` | [data.noviqai.xyz](https://data.noviqai.xyz) | Public network data and analytics |
| `@noviqai/worker` | CLI / browser library (npm) | Contributor worker (Ollama native, WebLLM browser) |

## Development

```bash
pnpm install

# Main site
pnpm --filter noviq-website dev

# Data dashboard
pnpm --filter noviq-data dev

# Native worker (requires a worker token + Ollama)
pnpm --filter @noviqai/worker dev -- --token YOUR_TOKEN --model qwen2.5:27b --pull
```

## Build

```bash
pnpm --filter noviq-website build
pnpm --filter noviq-data build
pnpm --filter @noviqai/worker build
```
