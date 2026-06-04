import { LabelPill } from "~/components/LabelPill";
import { Reveal } from "~/components/Reveal";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-white/5"
    >
      {/* Background glow + grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-40 mask-fade-b" />
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-accent/15 blur-[130px]" />
        <div className="absolute right-[8%] top-[30%] h-[320px] w-[320px] rounded-full bg-accent-cyan/[0.07] blur-[100px]" />
        <div className="absolute left-[6%] top-[50%] h-[280px] w-[280px] rounded-full bg-accent-violet/[0.07] blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:px-8 lg:pb-28 lg:pt-36">
        {/* Copy */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-slate-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-lime opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-lime" />
              </span>
              Agentic AI · Claude Opus · PR-gated
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Code as spec.
              <br />
              <span className="text-gradient">Driven by Jira.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-400">
              Write the story. Label it{" "}
              <LabelPill tone="ready">#ready</LabelPill>. An autonomous Claude
              Opus agent picks it up, implements it, runs tests and QA, and
              opens a pull request — your spec becomes shipped code while you
              stay in review.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#how" className="btn-primary">
                See how it works
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path
                    d="M4 10h12m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a
                href="https://github.com/afitterling/jira-coding-agent"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                Read the source
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
              {[
                ["2 min", "cron cadence"],
                ["1 microVM", "per story, isolated"],
                ["100%", "PR-gated review"],
              ].map(([stat, label]) => (
                <div key={label}>
                  <dt className="font-mono text-2xl font-semibold text-white">
                    {stat}
                  </dt>
                  <dd className="mt-1 text-xs leading-tight text-slate-500">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Visual */}
        <Reveal delay={200} className="lg:pl-4">
          <HeroVisual />
        </Reveal>
      </div>

      {/* Scroll indicator — hints there's more below the fold */}
      <a
        href="#how"
        aria-label="Scroll to see how it works"
        className="group absolute inset-x-0 bottom-6 z-10 mx-auto flex w-fit flex-col items-center gap-2 text-slate-500 transition-colors hover:text-slate-200"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
          Scroll
        </span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-white/20 p-1 group-hover:border-white/40">
          <span className="h-2 w-1 animate-scroll-dot rounded-full bg-current" />
        </span>
      </a>
    </section>
  );
}

/** A stylised "story → PR" card that hints at the pipeline. */
function HeroVisual() {
  return (
    <div className="relative animate-float">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-accent/20 via-transparent to-accent-cyan/10 blur-2xl" />
      <div className="card overflow-hidden p-1">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
          <span className="ml-3 font-mono text-xs text-slate-500">
            board: Kanban · agent run #284
          </span>
        </div>

        <div className="space-y-3 rounded-2xl bg-ink-900/80 p-4">
          {/* Jira story card */}
          <div className="rounded-xl border border-white/10 bg-ink-800/80 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-500">
                PROJ-142
              </span>
              <LabelPill tone="ready">#ready</LabelPill>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-100">
              Add rate-limit headers to the public API
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              AC: return X-RateLimit-* on every 200/429; cover with tests.
            </p>
          </div>

          {/* connector */}
          <div className="flex items-center justify-center gap-2 py-0.5 text-slate-600">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/40" />
            <span className="font-mono text-[11px] text-accent">
              agent implements →
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/40" />
          </div>

          {/* terminal lines */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[12px] leading-6">
            <p className="text-slate-500">
              <span className="text-accent-cyan">$</span> clone → branch{" "}
              <span className="text-slate-300">feat/proj-142</span>
            </p>
            <p className="text-slate-400">
              <span className="text-accent-lime">✓</span> implemented · 4 files
              changed
            </p>
            <p className="text-slate-400">
              <span className="text-accent-lime">✓</span> tests passed{" "}
              <span className="text-slate-600">(12/12)</span>
            </p>
            <p className="text-slate-400">
              <span className="text-accent-lime">✓</span> QA: edge cases +
              regressions clean
            </p>
            <p className="text-slate-300">
              <span className="text-accent-violet">→</span> opened PR{" "}
              <span className="underline decoration-dotted">#318</span>
            </p>
          </div>

          {/* outcome labels */}
          <div className="flex flex-wrap items-center gap-1.5">
            <LabelPill tone="implemented">#implemented</LabelPill>
            <LabelPill tone="tested">#tested</LabelPill>
            <LabelPill tone="qa">#qa-passed</LabelPill>
            <LabelPill tone="done">#done</LabelPill>
          </div>
        </div>
      </div>
    </div>
  );
}
