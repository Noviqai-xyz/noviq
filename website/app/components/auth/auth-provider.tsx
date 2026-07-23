import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { robinhoodChain, wagmiConfig } from "../../lib/chain";

const APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;

const queryClient = new QueryClient();

/**
 * Wraps the app in Privy (email + X sign-in and external EVM wallets) and wires
 * wagmi + react-query on top so on-chain reads/writes (staking) use the same
 * connected wallet. No embedded wallets are auto-created - pure auth + BYO wallet.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (!APP_ID) return <>{children}</>;

  return (
    <PrivyProvider
      appId={APP_ID}
      config={{
        loginMethods: ["email", "twitter", "wallet"],
        defaultChain: robinhoodChain,
        supportedChains: [robinhoodChain],
        appearance: {
          theme: "dark",
          accentColor: "#7ED6FF",
          logo: "/black_background-removebg-preview.png",
          walletChainType: "ethereum-only",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "off" },
          solana: { createOnLogin: "off" },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
