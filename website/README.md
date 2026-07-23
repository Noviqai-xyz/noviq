# Noviq Website

Landing page and app for [noviqai.xyz](https://noviqai.xyz).

- Marketing and network overview
- OpenAI-compatible API entry point
- Browser worker and native worker flows

## Development

From the workspace root:

```bash
pnpm install
pnpm dev:website
```

Or from this directory:

```bash
pnpm dev
```

Available at `http://localhost:5173`.

## Build

```bash
pnpm run build
```

## Docker

From the `noviq/` workspace root:

```bash
docker build -f website/Dockerfile -t noviq-website .
docker run -p 3000:3000 noviq-website
```
