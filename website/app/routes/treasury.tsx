import type { Route } from "./+types/treasury";
import { SiteFooter, SiteHeader } from "../components/layout/site-chrome";
import { Reveal } from "../components/util/reveal";
import { AreaChart } from "../components/brand/area-chart";
import {
  useTreasury,
  type TreasurySeriesPoint,
} from "../lib/use-treasury";

const BURN_COLOR = "#4ADE80";
const STAKE_COLOR = "#7ED6FF";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Treasury - NoviQ AI" },
    {
      name: "description",
      content:
        "100% of the compute margin and a share of $NOVIQ trading fees flow into the treasury. Half buys back and burns $NOVIQ; half is paid to stakers in USDC.",
    },
  ];
}

// ---- formatting helpers ----
const intFmt = new Intl.NumberFormat("en-US");
const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function compact(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}b`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}m`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return intFmt.format(Math.round(n));
}

function pct(n: number) {
  return `${n.toFixed(n < 10 ? 2 : 1)}%`;
}

function shortDate(ms: number) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(ms));
}

export default function TreasuryPage() {
  const { data, preview } = useTreasury();

  const topCards = [
    {
      value: intFmt.format(data.burnedForever),
      label: "$NOVIQ burned forever",
      sub: `${pct(data.burnedPctSupply)} of supply removed`,
      accent: true,
    },
    {
      value: usdFmt.format(data.returnedTotalUsd),
      label: "returned to holders + stakers",
      sub: "buybacks + USDC rewards",
    },
    {
      value: `${compact(data.staked)}`,
      label: "$NOVIQ staked",
      sub: `${pct(data.stakedPctSupply)} of supply`,
    },
  ];

  const bottomCards = [
    {
      value: usdFmt.format(data.totalSpentBuybacksUsd),
      label: "Total spent on buybacks",
    },
    {
      value: usdFmt.format(data.stakerRewardsPaidUsd),
      label: "Staker rewards paid",
    },
    {
      value: usdFmt.format(data.pendingBuybackUsd),
      label: "Pending buyback",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-black">
      <SiteHeader />
      <main className="page-shell relative pt-20 pb-24 md:pt-28">
        <Reveal>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              Treasury
            </h1>
            {preview && (
              <span className="rounded-full border border-white/[0.12] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a8a]">
                Preview data
              </span>
            )}
          </div>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#8a8a8a] md:text-lg">
            100% of the compute margin and a share of $NOVIQ trading fees flow
            into this treasury. Half buys back and burns $NOVIQ; half is paid to
            stakers in USDC. Everything below updates live.
          </p>
        </Reveal>

        {/* Top stat cards */}
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {topCards.map((c, i) => (
            <Reveal key={c.label} delay={i * 80} variant="scale">
              <div
                className={`glass-panel h-full rounded-2xl p-6 ${
                  c.accent
                    ? "border-[#4ADE80]/25 bg-[#4ADE80]/[0.04]"
                    : ""
                }`}
              >
                <p
                  className={`text-3xl font-semibold tracking-[-0.02em] ${
                    c.accent ? "text-[#4ADE80]" : ""
                  }`}
                >
                  {c.value}
                </p>
                <p className="mt-2 text-[15px] text-[#a3a3a3]">{c.label}</p>
                <p
                  className={`mt-1 text-[13px] ${
                    c.accent ? "text-[#4ADE80]/70" : "text-[#6f6f6f]"
                  }`}
                >
                  {c.sub}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Reveal delay={60} variant="left">
            <ChartCard
              caption="Cumulative $NOVIQ burned"
              headline={`${compact(data.burnedForever)} NOVIQ`}
              sub={`across ${data.buybackCount} buybacks`}
              series={data.burnedSeries}
              color={BURN_COLOR}
            />
          </Reveal>
          <Reveal delay={140} variant="right">
            <ChartCard
              caption="$NOVIQ staked over time"
              headline={`${compact(data.staked)} NOVIQ`}
              sub="rises on stakes, dips on unstakes"
              series={data.stakedSeries}
              color={STAKE_COLOR}
            />
          </Reveal>
        </div>

        {/* Bottom stat cards */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {bottomCards.map((c, i) => (
            <Reveal key={c.label} delay={i * 80} variant="fade">
              <div className="glass-panel h-full rounded-2xl p-6 text-center">
                <p className="text-2xl font-semibold tracking-[-0.02em]">
                  {c.value}
                </p>
                <p className="mt-1.5 text-[13px] text-[#6f6f6f]">{c.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ChartCard({
  caption,
  headline,
  sub,
  series,
  color,
}: {
  caption: string;
  headline: string;
  sub: string;
  series: TreasurySeriesPoint[];
  color: string;
}) {
  const values = series.map((p) => p.v);
  const startLabel = series.length ? shortDate(series[0].t) : "";
  const endLabel = series.length ? shortDate(series[series.length - 1].t) : "";

  return (
    <div className="glass-panel flex h-full flex-col rounded-2xl p-6">
      <p className="section-index">{caption}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
        {headline}
      </p>
      <p className="mt-1 text-[13px] text-[#6f6f6f]">{sub}</p>

      <div className="mt-5 h-40 w-full md:h-48">
        <AreaChart
          data={values}
          color={color}
          className="h-full w-full"
          ariaLabel={caption}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px] text-[#5c5c5c]">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
}
