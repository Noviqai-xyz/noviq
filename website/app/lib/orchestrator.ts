/**
 * Client for the Noviq orchestrator HTTP API (orchestrator.noviqai.xyz).
 *
 * Configure via env:
 *   VITE_ORCHESTRATOR_URL     e.g. https://orchestrator.noviqai.xyz  (HTTP API)
 *   VITE_ORCHESTRATOR_WS_URL  e.g. wss://orchestrator.noviqai.xyz/v1/worker
 * Falls back to localhost for dev.
 */
const env = import.meta.env;

// Deployed orchestrator (Railway). Overridable via VITE_ORCHESTRATOR_URL /
// VITE_ORCHESTRATOR_WS_URL; used automatically in production builds so the
// site works even if those env vars are not set on the host.
const PROD_ORCHESTRATOR_URL = "https://noviqorchestrator-production.up.railway.app";
const PROD_ORCHESTRATOR_WS_URL =
  "wss://noviqorchestrator-production.up.railway.app/v1/worker";

export const ORCHESTRATOR_URL =
  (env.VITE_ORCHESTRATOR_URL as string | undefined) ||
  (env.PROD ? PROD_ORCHESTRATOR_URL : "http://localhost:8787");

export const ORCHESTRATOR_WS_URL =
  (env.VITE_ORCHESTRATOR_WS_URL as string | undefined) ||
  (env.PROD ? PROD_ORCHESTRATOR_WS_URL : "ws://localhost:8787/v1/worker");

export type WorkerClass = "native" | "browser";

export interface UserStats {
  earnedTodayUsd: number;
  earnedTotalUsd: number;
  jobsCompleted: number;
  workersOnline: number;
  uptimeSeconds: number;
  tokensPerSecond: number;
  workers: Array<{
    id: string;
    workerClass: string;
    modelId: string | null;
    status: "online" | "offline";
    connectedAt: string;
  }>;
  tokens: Array<{
    token: string;
    workerClass: string;
    label: string | null;
    createdAt: string;
    revoked: boolean;
  }>;
  payout: {
    address: string | null;
    availableUsd: number;
    thresholdUsd: number;
    canRequest: boolean;
    history: PayoutRecord[];
  };
}

export interface PayoutRecord {
  id: string;
  amountUsd: number;
  address: string;
  status: string;
  txHash: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface NetworkStats {
  workersOnline: number;
  nativeOnline: number;
  browserOnline: number;
  jobsInQueue: number;
}

class OrchestratorError extends Error {}

async function req<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${ORCHESTRATOR_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new OrchestratorError(message);
  }
  return (await res.json()) as T;
}

export function getMyStats(accessToken: string): Promise<UserStats> {
  return req<UserStats>("/v1/me/stats", { token: accessToken });
}

export function getNetworkStats(): Promise<NetworkStats> {
  return req<NetworkStats>("/v1/network");
}

export function requestWorkerToken(
  accessToken: string,
  workerClass: WorkerClass,
): Promise<{ token: string; workerClass: WorkerClass }> {
  return req("/v1/worker-token", {
    method: "POST",
    token: accessToken,
    body: JSON.stringify({ workerClass }),
  });
}

export function revokeWorkerToken(
  accessToken: string,
  token: string,
): Promise<{ revoked: boolean }> {
  return req(`/v1/tokens/${encodeURIComponent(token)}/revoke`, {
    method: "POST",
    token: accessToken,
  });
}

export function setPayoutAddress(
  accessToken: string,
  address: string,
  chainId?: number,
): Promise<{ ok: boolean; address: string }> {
  return req("/v1/me/payout-address", {
    method: "POST",
    token: accessToken,
    body: JSON.stringify({ address, chainId }),
  });
}

export function requestPayout(accessToken: string): Promise<PayoutRecord> {
  return req("/v1/me/payout", { method: "POST", token: accessToken });
}

/** Validate an EVM (0x…40 hex) address client-side. */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address.trim());
}

/**
 * Dispatch a test job to one of the user's online workers and stream the
 * result via SSE. Calls `onToken` for each token, resolves on `done`.
 */
export async function runTestJob(
  accessToken: string,
  prompt: string,
  handlers: {
    onToken: (t: string) => void;
    onDone: (usage: { promptTokens: number; completionTokens: number }) => void;
    onError: (message: string) => void;
  },
): Promise<void> {
  const res = await fetch(`${ORCHESTRATOR_URL}/v1/test-job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok || !res.body) {
    let message = `Test job failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    handlers.onError(message);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const evLine = chunk.match(/^event: (.+)$/m);
      const dataLine = chunk.match(/^data: (.+)$/m);
      if (!evLine || !dataLine) continue;
      const event = evLine[1].trim();
      const data = JSON.parse(dataLine[1]);
      if (event === "token") handlers.onToken(data.token);
      else if (event === "done") handlers.onDone(data.usage);
      else if (event === "error") handlers.onError(data.message);
    }
  }
}

export const ORCHESTRATOR_CONFIGURED = Boolean(env.VITE_ORCHESTRATOR_URL);
