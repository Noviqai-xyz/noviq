import { useEffect, useState } from "react";
import { LoginButton } from "../auth/login-button";

const DATA_URL = "https://data.noviqai.xyz";
const DOCS_URL = "https://docs.noviqai.xyz";

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

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.245.198.372.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

const socialLinks = [
  { label: "X", href: "https://x.com/NoviqAIxyz", Icon: XIcon },
  { label: "Telegram", href: "https://t.me/noviqai_xyz", Icon: TelegramIcon },
  { label: "Discord", href: "https://discord.gg/dezEC5KmVS", Icon: DiscordIcon },
  { label: "GitHub", href: "https://github.com/Noviqai-xyz", Icon: GithubIcon },
];

const primaryLinks: { label: string; href: string; external?: boolean }[] = [
  { label: "Product", href: "#products" },
  { label: "Earn", href: "/earn" },
  { label: "Data", href: DATA_URL, external: true },
  { label: "Docs", href: DOCS_URL, external: true },
];

const noviqMenuItems = [
  { label: "Staking", href: "/staking" },
  { label: "Treasury", href: "/treasury" },
];

function MenuToggle({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="relative inline-flex h-10 w-10 items-center justify-center text-white md:hidden"
    >
      <span className="relative block h-4 w-6">
        <span
          className={`absolute left-0 top-0 h-[2px] w-full rounded-full bg-current transition-all duration-300 ${
            open ? "top-1/2 -translate-y-1/2 rotate-45" : ""
          }`}
        />
        <span
          className={`absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-current transition-all duration-300 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-current transition-all duration-300 ${
            open ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""
          }`}
        />
      </span>
    </button>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  // Flat list used for the staggered mobile menu.
  const mobileLinks = [
    ...primaryLinks.map((l) => ({ ...l, external: l.external ?? false })),
    ...noviqMenuItems.map((l) => ({ ...l, external: false })),
  ];

  return (
    <header className="load-fade sticky top-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between py-5 md:py-6">
        <a href="#" className="flex items-center gap-3.5" onClick={close}>
          <img
            src="/black_background-removebg-preview.png"
            alt="NoviQ"
            className="h-9 w-9 object-contain md:h-10 md:w-10"
          />
          <span className="text-sm font-semibold tracking-[0.22em]">NOVIQ AI</span>
        </a>
        <nav className="hidden items-center gap-10 text-sm text-[#8a8a8a] md:flex">
          {primaryLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="transition-colors duration-300 hover:text-white"
            >
              {l.label}
            </a>
          ))}

          <div className="nav-dropdown group relative">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 bg-transparent p-0 text-inherit transition-colors duration-300 group-hover:text-white group-focus-within:text-white"
              aria-haspopup="true"
            >
              $NOVIQ
              <ChevronDownIcon className="nav-dropdown-chevron h-3.5 w-3.5 text-[#5c5c5c] transition-[transform,color] duration-300 group-hover:text-white group-focus-within:text-white" />
            </button>
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
        <div className="flex items-center gap-4 md:gap-5">
          <div className="hidden items-center gap-3.5 md:flex">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="text-[#8a8a8a] transition-colors duration-300 hover:text-white"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
          <LoginButton className="btn-secondary hidden px-5 py-2.5 text-xs md:inline-flex" />
          <MenuToggle open={open} onClick={() => setOpen((v) => !v)} />
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          open ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="page-shell flex flex-col py-4">
          {mobileLinks.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              onClick={close}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              style={{ transitionDelay: open ? `${i * 45}ms` : "0ms" }}
              className={`border-b border-white/[0.05] py-4 text-lg text-[#c9c9c9] transition-all duration-300 hover:text-white ${
                open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              {item.label}
            </a>
          ))}

          <div
            style={{ transitionDelay: open ? `${mobileLinks.length * 45}ms` : "0ms" }}
            className={`mt-6 transition-all duration-300 ${
              open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <LoginButton className="btn-primary w-full justify-center px-5 py-3 text-sm" />
            <div className="mt-6 flex items-center gap-6">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  onClick={close}
                  className="text-[#8a8a8a] transition-colors duration-300 hover:text-white"
                >
                  <Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </nav>
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
            Uncensored, private, decentralized inference - powered by GPUs people
            contribute, not rent.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="text-[#8a8a8a] transition-colors duration-300 hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm text-[#8a8a8a] md:items-end">
          <p>© {new Date().getFullYear()} Noviq AI</p>
          <div className="flex gap-8">
            <a href="https://noviqai.xyz" className="hover:text-white">
              noviqai.xyz
            </a>
            <a href={DOCS_URL} className="hover:text-white">
              Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
