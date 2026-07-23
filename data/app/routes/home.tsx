import type { Route } from "./+types/home";
import { NoviqLogo } from "../components/noviq-logo";

const SITE_URL = "https://noviqai.xyz";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Noviq AI Data - Network Analytics" },
    {
      name: "description",
      content:
        "Live network data for Noviq AI - requests, inference tokens, contributors, and settlement activity.",
    },
    { property: "og:url", content: "https://data.noviqai.xyz" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <NoviqLogo />
            <div>
              <p className="text-sm font-semibold tracking-[0.2em]">NOVIQ DATA</p>
              <p className="text-xs text-zinc-500">data.noviqai.xyz</p>
            </div>
          </div>
          <a
            href={SITE_URL}
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← noviqai.xyz
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 max-w-2xl space-y-4">
          <p className="text-sm tracking-[0.2em] text-zinc-500">NETWORK DATA</p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Everything happening on the network
          </h1>
          <p className="text-zinc-400">
            Public metrics for contributed compute, inference volume, and
            settlement - no prompt or response content, ever.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6"
            >
              <p className="text-sm text-zinc-500">{metric.label}</p>
              <p className="mt-3 font-mono text-3xl font-medium tracking-tight">
                {metric.value}
              </p>
              <p className="mt-2 text-xs text-zinc-500">{metric.hint}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-medium">Inference by model</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Output tokens generated across the network, by model tier.
            </p>
            <div className="mt-6 space-y-4">
              {models.map((model) => (
                <div key={model.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{model.name}</span>
                    <span className="font-mono text-zinc-400">{model.share}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: model.share }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-medium">Contributor mix</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Active workers by class over the last 24 hours.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {contributors.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-zinc-900/50 p-5"
                >
                  <p className="text-sm text-zinc-500">{item.label}</p>
                  <p className="mt-2 font-mono text-2xl">{item.value}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-white/15 p-8 text-center">
          <p className="text-sm tracking-[0.2em] text-zinc-500">COMING ONLINE</p>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Live data feeds will connect here as the orchestrator ships metering
            records - token counts and settlement events only.
          </p>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Noviq AI</p>
          <a href={SITE_URL} className="hover:text-white">
            noviqai.xyz
          </a>
        </div>
      </footer>
    </div>
  );
}

const metrics = [
  {
    label: "Requests (24h)",
    value: "-",
    hint: "Completed inference jobs",
  },
  {
    label: "Output tokens (24h)",
    value: "-",
    hint: "Billing unit across all models",
  },
  {
    label: "Active contributors",
    value: "-",
    hint: "Browser + native workers online",
  },
  {
    label: "USDG settled (24h)",
    value: "-",
    hint: "70% contributors · 30% treasury",
  },
];

const models = [
  { name: "Qwen3 8B (browser)", share: "-" },
  { name: "Noviq Max 27B (native)", share: "-" },
  { name: "Other", share: "-" },
];

const contributors = [
  { label: "Browser workers", value: "-" },
  { label: "Native workers", value: "-" },
];
