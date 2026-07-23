import { defineChain, type Address } from "viem";
import { http } from "wagmi";
import { createConfig } from "@privy-io/wagmi";

/**
 * Robinhood Chain (EVM L2) - configured entirely from env so the real network
 * details and the launchpad token address can be dropped in without code changes.
 *
 * Fill these in `.env` once the token is live:
 *   VITE_CHAIN_ID, VITE_CHAIN_RPC_URL, VITE_CHAIN_NAME, VITE_CHAIN_EXPLORER,
 *   VITE_CHAIN_CURRENCY_SYMBOL,
 *   VITE_NOVIQ_TOKEN_ADDRESS, VITE_REWARD_TOKEN_ADDRESS, VITE_STAKING_ADDRESS
 */
const env = import.meta.env;

export const CHAIN_ID = Number(env.VITE_CHAIN_ID ?? 1);
const RPC_URL = (env.VITE_CHAIN_RPC_URL as string) ?? "";
const CHAIN_NAME = (env.VITE_CHAIN_NAME as string) ?? "Robinhood Chain";
const EXPLORER = (env.VITE_CHAIN_EXPLORER as string) ?? "";
const CURRENCY_SYMBOL = (env.VITE_CHAIN_CURRENCY_SYMBOL as string) ?? "ETH";

export const robinhoodChain = defineChain({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  nativeCurrency: { name: CURRENCY_SYMBOL, symbol: CURRENCY_SYMBOL, decimals: 18 },
  rpcUrls: {
    default: { http: RPC_URL ? [RPC_URL] : [] },
  },
  blockExplorers: EXPLORER
    ? { default: { name: "Explorer", url: EXPLORER } }
    : undefined,
});

const ZERO: Address = "0x0000000000000000000000000000000000000000";

/** Contract + token addresses (env-driven; ZERO means "not configured yet"). */
export const addresses = {
  staking: ((env.VITE_STAKING_ADDRESS as Address) ?? ZERO) as Address,
  noviq: ((env.VITE_NOVIQ_TOKEN_ADDRESS as Address) ?? ZERO) as Address,
  reward: ((env.VITE_REWARD_TOKEN_ADDRESS as Address) ??
    env.VITE_NOVIQ_TOKEN_ADDRESS ??
    ZERO) as Address,
};

export const isConfigured =
  addresses.staking !== ZERO && addresses.noviq !== ZERO && !!RPC_URL;

/** wagmi config wired for Privy - Privy manages connectors/active wallet. */
export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  transports: { [robinhoodChain.id]: http(RPC_URL || undefined) },
  ssr: true,
});
