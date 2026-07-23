# @noviq/orchestrator

The worker control plane for Noviq - a standalone Node service deployed at
`orchestrator.noviqai.xyz`. It:

- accepts **worker WebSocket** connections at `/v1/worker` (the protocol
  `@noviq/worker` speaks),
- issues and verifies **worker tokens** from a signed-in Privy session,
- **dispatches inference jobs** to online workers and **meters earnings**,
- exposes user + network **stats** for the website's `/earn` page.

## Stack

Fastify (HTTP) + `ws` (WebSocket) + Drizzle ORM over **Supabase Postgres** +
`@privy-io/server-auth` for token verification.

## Setup

1. **Database (Supabase):** create a project, then run
   [`drizzle/0000_init.sql`](./drizzle/0000_init.sql) in the Supabase SQL Editor.
   (Or set `DATABASE_URL` and run `pnpm --filter @noviq/orchestrator db:push`.)
2. **Env:** `cp .env.example .env` and fill in `DATABASE_URL` (Supabase
   *Transaction* pooler string, port 6543), `PRIVY_APP_ID`, `PRIVY_APP_SECRET`,
   and `ALLOWED_ORIGINS` (the website origins).
3. **Run:**
   ```bash
   pnpm --filter @noviq/orchestrator dev     # tsx watch
   # or
   pnpm --filter @noviq/orchestrator build && pnpm --filter @noviq/orchestrator start
   ```

## HTTP API

All authenticated routes take `Authorization: Bearer <privy-access-token>`
(from the website's `getAccessToken()`).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET`  | `/health` | - | Liveness |
| `POST` | `/v1/worker-token` | Privy | Issue a worker token `{ workerClass, label? }` → `{ token }` |
| `POST` | `/v1/tokens/:token/revoke` | Privy | Revoke a token you own |
| `GET`  | `/v1/me/stats` | Privy | Dashboard stats (earnings, workers, tokens, tok/s) |
| `GET`  | `/v1/network` | - | Public network stats (workers online, queue) |
| `POST` | `/v1/test-job` | Privy | Dispatch `{ prompt }` to one of your online workers; **SSE** stream of `token` / `done` / `error` |

## WebSocket `/v1/worker`

Implements the `@noviq/worker` protocol:

- **in:** `register` → `registered`; `heartbeat` / `pong`; `job_token` /
  `job_complete` / `job_error`
- **out:** `registered`, `job`, `ping`, `error`

Native workers authenticate via the `Authorization` header **and** the token in
the `register` payload; browser workers via the `register` payload only.

## Deploy

`Dockerfile` builds a production image (`node dist/index.js` on `:8787`). Put it
behind TLS at `orchestrator.noviqai.xyz` so the worker's default
`wss://orchestrator.noviqai.xyz/v1/worker` resolves.
