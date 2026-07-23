import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

const APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;

/**
 * Wraps the app in Privy, configured for email + X (Twitter) sign-in only.
 * No embedded wallets are created — this is pure authentication.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (!APP_ID) return <>{children}</>;

  return (
    <PrivyProvider
      appId={APP_ID}
      config={{
        loginMethods: ["email", "twitter"],
        appearance: {
          theme: "dark",
          accentColor: "#7ED6FF",
          logo: "/black_background-removebg-preview.png",
        },
        embeddedWallets: { createOnLogin: "off" },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
