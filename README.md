# Noviq AI

Inference network powered by contributed compute — [noviqai.xyz](https://noviqai.xyz)

| Package | Domain / role | Purpose |
|---------|---------------|---------|
| `noviq-website` | [noviqai.xyz](https://noviqai.xyz) | Landing page + app (API, browser worker, native worker) |
| `noviq-data` | [data.noviqai.xyz](https://data.noviqai.xyz) | Public network data and analytics |
| `noviq-client` | CLI / browser library | Contributor worker (Ollama native, WebLLM browser) |

## Development

```bash
pnpm install

# Main site
pnpm --filter noviq-website dev

# Data dashboard
pnpm --filter noviq-data dev

# Native worker (requires wallet + Ollama)
pnpm --filter noviq-client dev -- --wallet 0x... --model qwen2.5:27b
```

## Build

```bash
pnpm --filter noviq-website build
pnpm --filter noviq-data build
pnpm --filter noviq-client build
```
