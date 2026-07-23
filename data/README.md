# Noviq Data

Public network data dashboard for [data.noviqai.xyz](https://data.noviqai.xyz).

- Inference volume and token metering
- Contributor activity
- Settlement and treasury metrics

No prompt or response content is shown - only aggregate network data.

## Development

From the workspace root:

```bash
pnpm install
pnpm dev:data
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
docker build -f data/Dockerfile -t noviq-data .
docker run -p 3000:3000 noviq-data
```
