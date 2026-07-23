import { useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import type { Route } from "./+types/staking";
import { SiteFooter, SiteHeader } from "../components/layout/site-chrome";
import { Reveal } from "../components/util/reveal";
import { useStaking } from "../lib/use-staking";
import { CHAIN_ID, robinhoodChain } from "../lib/chain";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stake $NOVIQ — NoviQ AI" },
    {
      name: "description",
      content:
        "Stake $NOVIQ from self-custody and earn a share of real network revenue. Only you can unstake or claim — no server holds your funds.",
    },
  ];
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Trim a decimal string to `n` significant fractional digits for display. */
function pretty(value: string, n = 4) {
  if (!value) return "0";
  const [int, frac] = value.split(".");
  if (!frac) return int;
  const trimmed = frac.slice(0, n).replace(/0+$/, "");
  return trimmed ? `${int}.${trimmed}` : int;
}

export default function StakingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black">
      <SiteHeader />
      <main className="page-shell relative pt-20 pb-24 md:pt-28">
        <Reveal>
          <p className="label-caps">Private inference economy</p>
          <h1 className="mt-5 text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            Stake <span className="text-gradient">$NOVIQ</span>
            <span className="ml-3 align-middle text-base font-normal text-[#6f6f6f]">
              · self-custody
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#8a8a8a] md:text-lg">
            Your $NOVIQ stays in your own on-chain vault. Only you can unstake or
            claim — no server holds your funds. Stakers earn a share of real
            network revenue from inference.
          </p>
        </Reveal>

        <StatsRow />
        <StakeCard />
        <RevenueNote />
      </main>
      <SiteFooter />
    </div>
  );
}

function StatsRow() {
  const mounted = useMounted();
  const { data, isConfigured } = useStaking();

  const stats = [
    {
      label: "Total staked",
      value: mounted && isConfigured ? `${pretty(data.fmt.totalStaked, 2)}` : "—",
      unit: data.stakeSymbol,
    },
    {
      label: "Your stake",
      value: mounted && isConfigured ? pretty(data.fmt.staked, 2) : "—",
      unit: data.stakeSymbol,
    },
    {
      label: "Claimable",
      value: mounted && isConfigured ? pretty(data.fmt.pending, 4) : "—",
      unit: data.rewardSymbol,
    },
    { label: "Reward source", value: "Real yield", unit: "network revenue" },
  ];

  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 80} variant="scale">
          <div className="glass-panel h-full rounded-2xl p-6">
            <p className="section-index">{s.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
              {s.value}
            </p>
            <p className="mt-1 text-[13px] text-[#6f6f6f]">{s.unit}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function StakeCard() {
  const mounted = useMounted();
  const { login } = usePrivy();
  const { isConnected } = useAccount();
  const walletChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const {
    isConfigured,
    data,
    refetch,
    tx,
    actions,
  } = useStaking();

  const [mode, setMode] = useState<"stake" | "unstake">("stake");
  const [amountStr, setAmountStr] = useState("");

  // Refresh balances after a tx confirms.
  useEffect(() => {
    if (tx.isConfirmed) {
      refetch();
      setAmountStr("");
      tx.reset();
    }
  }, [tx.isConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  const amount = useMemo(() => {
    try {
      if (!amountStr || Number(amountStr) <= 0) return 0n;
      return parseUnits(amountStr, data.stakeDecimals);
    } catch {
      return 0n;
    }
  }, [amountStr, data.stakeDecimals]);

  const wrongNetwork = isConnected && walletChainId !== CHAIN_ID;
  const busy = tx.isPending || tx.isConfirming;

  const max = mode === "stake" ? data.fmt.walletBalance : data.fmt.staked;
  const overBalance =
    mode === "stake" ? amount > data.walletBalance : amount > data.staked;
  const needsApproval = mode === "stake" && actions.needsApproval(amount);

  async function onPrimary() {
    if (amount <= 0n || overBalance || busy) return;
    try {
      if (mode === "stake") {
        if (needsApproval) await actions.approve(amount);
        else await actions.stake(amount);
      } else {
        await actions.unstake(amount);
      }
    } catch {
      /* user rejected or tx error — surfaced by wallet */
    }
  }

  // ---- Not configured yet (token/contract not deployed) ----
  if (!isConfigured) {
    return (
      <Reveal>
        <div className="glass-panel mt-6 rounded-[1.75rem] p-8 md:p-10">
          <p className="section-index text-[#7ED6FF]/70">Coming online</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] md:text-2xl">
            Staking activates when $NOVIQ is live
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#8a8a8a]">
            The staking vault is deployed and audited before launch. Once the
            token mint and staking contract addresses are set, this page connects
            to them automatically.
          </p>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <div className="glass-panel mx-auto mt-6 max-w-lg rounded-[1.75rem] p-7 md:p-8">
        {!mounted || !isConnected ? (
          <div>
            <p className="text-[15px] leading-relaxed text-[#a3a3a3]">
              Connect a wallet (Phantom-style EVM wallets, or email via Privy) to
              stake from self-custody.
            </p>
            <button
              type="button"
              onClick={() => login()}
              className="btn-primary mt-6 w-full"
            >
              Connect Wallet
            </button>
          </div>
        ) : wrongNetwork ? (
          <div>
            <p className="text-[15px] text-[#a3a3a3]">
              Switch to {robinhoodChain.name} to continue.
            </p>
            <button
              type="button"
              onClick={() => switchChain({ chainId: CHAIN_ID })}
              className="btn-primary mt-6 w-full"
            >
              Switch network
            </button>
          </div>
        ) : (
          <>
            {/* Mode toggle */}
            <div className="flex rounded-full border border-white/[0.08] p-1">
              {(["stake", "unstake"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-full py-2 text-sm font-medium capitalize transition-colors duration-300 ${
                    mode === m
                      ? "bg-white text-black"
                      : "text-[#8a8a8a] hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Amount input */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-[13px] text-[#6f6f6f]">
                <span>Amount</span>
                <span>
                  {mode === "stake" ? "Wallet" : "Staked"}: {pretty(max, 4)}{" "}
                  {data.stakeSymbol}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-3.5">
                <input
                  inputMode="decimal"
                  placeholder="0.0"
                  value={amountStr}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) setAmountStr(v);
                  }}
                  className="w-full bg-transparent text-lg text-white outline-none placeholder:text-[#4a4a4a]"
                />
                <span className="text-sm font-medium text-[#8a8a8a]">
                  {data.stakeSymbol}
                </span>
                <button
                  type="button"
                  onClick={() => setAmountStr(max)}
                  className="rounded-full border border-white/[0.12] px-3 py-1 text-xs font-medium text-[#D4F3FF] transition-colors hover:border-white/30"
                >
                  MAX
                </button>
              </div>
              {overBalance && (
                <p className="mt-2 text-xs text-[#ff9b9b]">
                  Exceeds your{" "}
                  {mode === "stake" ? "wallet balance" : "staked balance"}.
                </p>
              )}
            </div>

            {/* Primary action */}
            <button
              type="button"
              disabled={amount <= 0n || overBalance || busy}
              onClick={onPrimary}
              className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy
                ? tx.isConfirming
                  ? "Confirming…"
                  : "Check wallet…"
                : mode === "stake"
                  ? needsApproval
                    ? `Approve ${data.stakeSymbol}`
                    : "Stake"
                  : "Unstake"}
            </button>

            {/* Rewards row */}
            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-index">Claimable rewards</p>
                  <p className="mt-1.5 text-lg font-semibold">
                    {pretty(data.fmt.pending, 6)} {data.rewardSymbol}
                  </p>
                </div>
                <div className="flex gap-2">
                  {data.rewardIsStake && (
                    <button
                      type="button"
                      disabled={data.pending <= 0n || busy}
                      onClick={() => actions.compound().catch(() => {})}
                      className="btn-secondary px-4 py-2 text-xs disabled:opacity-40"
                    >
                      Compound
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={data.pending <= 0n || busy}
                    onClick={() => actions.claim().catch(() => {})}
                    className="btn-primary px-4 py-2 text-xs disabled:opacity-40"
                  >
                    Claim
                  </button>
                </div>
              </div>
            </div>

            {data.cooldownSeconds > 0 && (
              <p className="mt-4 text-center text-xs text-[#6f6f6f]">
                Unstake cooldown: {Math.round(data.cooldownSeconds / 3600)}h after
                your last stake.
              </p>
            )}
          </>
        )}
      </div>
    </Reveal>
  );
}

function RevenueNote() {
  const points = [
    {
      title: "Where yield comes from",
      body: "Every paid inference request is split on-chain: the majority to the GPU workers that served it, a treasury cut for privacy research, and a slice funded to this staking pool.",
    },
    {
      title: "Paid for real work",
      body: "Worker payouts release only against a valid correctness/privacy receipt — the same receipt discipline that proves the network ran your job right.",
    },
    {
      title: "Self-custody, always",
      body: "Principal lives in a vault only your wallet can withdraw from. No admin key can move, seize, or slash your stake.",
    },
  ];
  return (
    <div className="mt-16 grid gap-4 md:grid-cols-3">
      {points.map((p, i) => (
        <Reveal key={p.title} delay={i * 90} variant={i === 0 ? "left" : i === 2 ? "right" : "up"}>
          <article className="card glass-panel h-full rounded-[1.5rem] p-7">
            <h3 className="text-base font-semibold tracking-[-0.02em] text-[#D4F3FF]">
              {p.title}
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[#8a8a8a]">
              {p.body}
            </p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
