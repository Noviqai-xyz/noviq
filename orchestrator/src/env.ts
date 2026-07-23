import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required env var ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : fallback;
}

export const env = {
  port: Number(optional("PORT", "8787")),
  databaseUrl: required("DATABASE_URL"),
  privyAppId: required("PRIVY_APP_ID"),
  privyAppSecret: required("PRIVY_APP_SECRET"),
  allowedOrigins: optional(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,https://noviqai.xyz,https://www.noviqai.xyz",
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  pingIntervalMs: Number(optional("PING_INTERVAL_SEC", "30")) * 1000,
  payoutThresholdUsd: Number(optional("PAYOUT_THRESHOLD_USD", "10")),
  isProd: process.env.NODE_ENV === "production",
} as const;
