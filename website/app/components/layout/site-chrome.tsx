import { LoginButton } from "../auth/login-button";

const DATA_URL = "https://data.noviqai.xyz";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const noviqMenuItems = [
  { label: "Staking", href: "#token-staking" },
  { label: "Treasury", href: "#token-treasury" },
  { label: "Data", href: DATA_URL, external: true },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between py-5 md:py-6">
        <a href="#" className="flex items-center gap-3.5">
          <img
            src="/black_background-removebg-preview.png"
            alt="NoviQ"
            className="h-9 w-9 object-contain md:h-10 md:w-10"
          />
          <span className="text-sm font-semibold tracking-[0.22em]">NOVIQ AI</span>
        </a>
        <nav className="hidden items-center gap-10 text-sm text-[#8a8a8a] md:flex">
          <a href="#private" className="transition-colors duration-300 hover:text-white">
            Private
          </a>
          <a href="#products" className="transition-colors duration-300 hover:text-white">
            Product
          </a>

          <div className="nav-dropdown group relative">
            <a
              href="#token"
              className="inline-flex items-center gap-1.5 transition-colors duration-300 group-hover:text-white"
              aria-haspopup="true"
            >
              $NOVIQ
              <ChevronDownIcon className="nav-dropdown-chevron h-3.5 w-3.5 text-[#5c5c5c] transition-[transform,color] duration-300 group-hover:text-white group-focus-within:text-white" />
            </a>
            <div className="nav-dropdown-panel pointer-events-none absolute left-1/2 top-full z-50 w-44 -translate-x-1/2 pt-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <div className="glass-panel overflow-hidden rounded-2xl border border-white/[0.1] bg-black/95 py-2 shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
                {noviqMenuItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="nav-dropdown-link block px-5 py-3 text-sm text-[#8a8a8a] transition-colors duration-200 hover:bg-white/[0.04] hover:text-white"
                    {...(item.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <LoginButton className="btn-secondary hidden px-5 py-2.5 text-xs md:inline-flex" />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="page-shell flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/black_background-removebg-preview.png"
              alt=""
              className="h-8 w-8 object-contain"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold tracking-[0.22em]">NOVIQ AI</span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[#8a8a8a]">
            Uncensored, private, decentralized inference — powered by GPUs people
            contribute, not rent.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-[#8a8a8a] md:items-end">
          <p>© {new Date().getFullYear()} Noviq AI</p>
          <div className="flex gap-8">
            <a href="https://noviqai.xyz" className="hover:text-white">
              noviqai.xyz
            </a>
            <a href={DATA_URL} className="hover:text-white">
              data.noviqai.xyz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
