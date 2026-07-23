import { HeroVisual } from "../brand/hero-visual";

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden">
      <HeroVisual />
      <div className="page-shell relative z-10 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="reveal is-visible label-caps">Private inference network</p>
          <h1 className="reveal is-visible mt-6 text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
            Private inference,
            <br />
            <span className="text-gradient">actually proven.</span>
          </h1>
          <p className="reveal is-visible mt-7 max-w-lg text-lg leading-relaxed text-[#a3a3a3] md:text-xl">
            Uncensored and decentralized — and the first network built to prove
            your prompts stay private.
          </p>
          <div className="reveal is-visible mt-10 flex flex-wrap gap-4">
            <a href="#problem" className="btn-primary">
              See the problem
            </a>
            <a href="#products" className="btn-secondary">
              Use the network
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 md:block">
        <span className="label-caps animate-float">scroll</span>
      </div>
    </section>
  );
}
