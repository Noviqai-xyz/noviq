import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { authenticate, AuthError } from "../auth/privy.js";
import { issueWorkerToken, revokeWorkerToken } from "../auth/tokens.js";
import { dispatchJob } from "../jobs.js";
import { registry } from "../registry.js";
import { getNetworkStats, getUserStats } from "../stats.js";
import { getNetworkOverview } from "../analytics.js";
import {
  isValidEvmAddress,
  PayoutError,
  requestPayout,
  setPayoutAddress,
} from "../payouts.js";

const workerTokenBody = z.object({
  workerClass: z.enum(["native", "browser"]),
  label: z.string().max(80).optional(),
});

const testJobBody = z.object({
  prompt: z.string().min(1).max(8000),
  model: z.string().optional(),
  maxTokens: z.number().int().positive().max(2048).optional(),
});

const payoutAddressBody = z.object({
  address: z.string().refine(isValidEvmAddress, "Invalid EVM address"),
  chainId: z.number().int().positive().optional(),
});

export function registerRoutes(app: FastifyInstance): void {
  app.get("/health", async () => ({ ok: true }));

  // Issue a worker token for the signed-in user.
  app.post("/v1/worker-token", async (req, reply) => {
    const user = await requireUser(req.headers.authorization);
    const body = workerTokenBody.parse(req.body);
    const issued = await issueWorkerToken(user.id, body.workerClass, body.label);
    return reply.send(issued);
  });

  // Revoke a worker token the user owns.
  app.post<{ Params: { token: string } }>(
    "/v1/tokens/:token/revoke",
    async (req, reply) => {
      const user = await requireUser(req.headers.authorization);
      const ok = await revokeWorkerToken(user.id, req.params.token);
      if (!ok) return reply.code(404).send({ error: "Token not found" });
      return reply.send({ revoked: true });
    },
  );

  // Signed-in user's dashboard stats.
  app.get("/v1/me/stats", async (req, reply) => {
    const user = await requireUser(req.headers.authorization);
    const stats = await getUserStats(user.id);
    return reply.send(stats);
  });

  // Public network stats (also used by the data dashboard).
  app.get("/v1/network", async (_req, reply) => {
    return reply.send(getNetworkStats());
  });

  // Public, aggregate-only network analytics for the data dashboard
  // (totals + live counts + 30-day time series). No auth; no content.
  app.get("/v1/network/overview", async (_req, reply) => {
    const overview = await getNetworkOverview();
    // Cache at the edge briefly - this is heavy-ish and updates slowly.
    reply.header("Cache-Control", "public, max-age=10");
    return reply.send(overview);
  });

  // Set / update the user's payout (EVM) address.
  app.post("/v1/me/payout-address", async (req, reply) => {
    const user = await requireUser(req.headers.authorization);
    const body = payoutAddressBody.parse(req.body);
    await setPayoutAddress(user.id, body.address, body.chainId);
    return reply.send({ ok: true, address: body.address });
  });

  // Request a withdrawal of the full available balance to the payout address.
  app.post("/v1/me/payout", async (req, reply) => {
    const user = await requireUser(req.headers.authorization);
    try {
      const payout = await requestPayout(user.id);
      return reply.send(payout);
    } catch (e) {
      if (e instanceof PayoutError) {
        return reply.code(400).send({ error: e.message });
      }
      throw e;
    }
  });

  // Dispatch a test inference job to one of the user's own online workers and
  // stream the result back as SSE. Proves the full round-trip + metering.
  app.post("/v1/test-job", async (req, reply) => {
    const user = await requireUser(req.headers.authorization);
    const body = testJobBody.parse(req.body);

    const workers = registry.onlineForUser(user.id);
    const worker = workers[0];
    if (!worker) {
      return reply
        .code(409)
        .send({ error: "No online workers. Start a worker first." });
    }

    openSse(reply);
    const model = body.model ?? worker.model?.ref ?? worker.model?.id ?? "default";

    await new Promise<void>((resolve) => {
      void dispatchJob({
        worker,
        model,
        messages: [{ role: "user", content: body.prompt }],
        maxTokens: body.maxTokens,
        requesterId: user.id,
        onToken: (token) => sse(reply, "token", { token }),
        onDone: (usage) => {
          sse(reply, "done", { usage });
          reply.raw.end();
          resolve();
        },
        onError: (message) => {
          sse(reply, "error", { message });
          reply.raw.end();
          resolve();
        },
      }).catch((err: unknown) => {
        sse(reply, "error", {
          message: err instanceof Error ? err.message : "dispatch failed",
        });
        reply.raw.end();
        resolve();
      });
    });
  });

  // Turn AuthError / Zod errors into clean HTTP responses.
  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof AuthError) {
      return reply.code(401).send({ error: error.message });
    }
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: "Invalid request", issues: error.issues });
    }
    app.log.error(error);
    return reply.code(500).send({ error: "Internal error" });
  });
}

async function requireUser(authHeader: string | undefined) {
  return authenticate(authHeader);
}

function openSse(reply: FastifyReply): void {
  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  reply.hijack();
}

function sse(reply: FastifyReply, event: string, data: unknown): void {
  reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}
