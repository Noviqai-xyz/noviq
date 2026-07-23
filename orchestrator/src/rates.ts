import type { TokenUsage, WorkerClass } from "./protocol.js";

// Per-job earnings, USD. Mirrors the website "products" copy:
//   Native  $0.10-0.14 / job
//   Browser $0.07 / job
// A small usage-based component rewards longer completions.
const RATES: Record<WorkerClass, { base: number; perKToken: number }> = {
  native: { base: 0.1, perKToken: 0.04 },
  browser: { base: 0.06, perKToken: 0.01 },
};

/** Compute the USD earning for a completed job. */
export function computeEarningUsd(
  workerClass: WorkerClass,
  usage: TokenUsage,
): number {
  const rate = RATES[workerClass] ?? RATES.browser;
  const kTokens = (usage.completionTokens || 0) / 1000;
  const amount = rate.base + kTokens * rate.perKToken;
  // 6 dp to match the numeric(12,6) column.
  return Math.round(amount * 1e6) / 1e6;
}
