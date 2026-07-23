/**
 * Client for the Noviq orchestrator's public analytics endpoint.
 * Overridable via VITE_ORCHESTRATOR_URL; defaults to the deployed Railway
 * orchestrator in production so the dashboard works without extra config.
 */
const env = import.meta.env;

const PROD_ORCHESTRATOR_URL =
  "https://noviqorchestrator-production.up.railway.app";

export const ORCHESTRATOR_URL =
  (env.VITE_ORCHESTRATOR_URL as string | undefined) ||
  (env.PROD ? PROD_ORCHESTRATOR_URL : "http://localhost:8787");

export interface JobsDay {
  date: string;
  native: number;
  browser: number;
}
export interface TokensDay {
  date: string;
  tokens: number;
}
export interface SpeedDay {
  date: string;
  tokPerSec: number;
}
export interface CountDay {
  date: string;
  count: number;
}
export interface CumulativeDay {
  date: string;
  total: number;
}

export interface NetworkOverview {
  totals: {
    tokensGenerated: number;
    jobsCompleted: number;
    settledUsd: number;
    registeredUsers: number;
  };
  live: {
    workersOnline: number;
    nativeOnline: number;
    browserOnline: number;
    busyNow: number;
    queued: number;
  };
  series: {
    jobsPerDay: JobsDay[];
    tokensPerDay: TokensDay[];
    speedPerDay: SpeedDay[];
    signupsPerDay: CountDay[];
    cumulativeUsers: CumulativeDay[];
  };
  generatedAt: string;
}

export async function getNetworkOverview(
  signal?: AbortSignal,
): Promise<NetworkOverview> {
  const res = await fetch(`${ORCHESTRATOR_URL}/v1/network/overview`, {
    signal,
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`overview ${res.status}`);
  }
  return (await res.json()) as NetworkOverview;
}

// ---- formatting helpers ---------------------------------------------------

export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function fmtCompact(n: number): string {
  if (n < 1000) return String(Math.round(n));
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000_000_000).toFixed(1)}B`;
}

export function fmtUsd(n: number): string {
  if (n >= 1000) return `$${fmtCompact(n)}`;
  return `$${n.toFixed(n < 1 ? 4 : 2)}`;
}

/** "07-23" style short label from a YYYY-MM-DD date. */
export function shortDay(date: string): string {
  return date.slice(5);
}
