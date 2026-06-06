import { LabelPill } from "~/components/LabelPill";
import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

export function Hero() {
  const { t } = useT();
  const h = t.hero;
  return (
    <section
      id="top"
      className="relative min-h-screen overflow-hidden border-b border-white/5 bg-black"
    >
      {/* Background: deep black base, tight accent glow, grid, and a vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* near-black radial base */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#0a0a16_0%,#040409_45%,#000000_100%)]" />
        <div className="absolute inset-0 bg-grid opacity-[0.22] mask-fade-b" />
        {/* one tight, saturated glow — sexier against the black */}
        <div className="absolute left-1/2 top-[-12%] h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]" />
        <div className="absolute right-[10%] top-[34%] h-[300px] w-[300px] rounded-full bg-accent-violet/[0.10] blur-[120px]" />
        {/* edge vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_40%,transparent_55%,rgba(0,0,0,0.85)_100%)]" />
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
              sp<span className="text-accent-lime">33</span>c · {h.badgeSuffix}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {h.titleA}
              <br />
              <span className="text-gradient">{h.titleB}</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-400">
              {h.leadP1}
              <LabelPill tone="ready">#ready</LabelPill>
              {h.leadP2}
              <a href="#loop" className="font-medium text-violet-300 underline decoration-dotted underline-offset-2 hover:text-violet-200">
                {h.leadLink}
              </a>
              {h.leadP3}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/getting-started" className="btn-primary">
                {h.ctaPrimary}
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
              <a href="#loop" className="btn-ghost">
                {h.ctaGhost}
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
              {h.stats.map(([stat, label]) => (
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
          <HeroVisual v={h.visual} />
        </Reveal>
      </div>

    </section>
  );
}

/** A stylised "story → PR" card that hints at the pipeline. */
function HeroVisual({ v }: { v: ReturnType<typeof useT>["t"]["hero"]["visual"] }) {
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
            {v.board}
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
              {v.story}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {v.ac}
            </p>
          </div>

          {/* connector */}
          <div className="flex items-center justify-center gap-2 py-0.5 text-slate-600">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/40" />
            <span className="font-mono text-[11px] text-accent">
              {v.connector}
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
              <span className="text-accent-lime">✓</span> {v.implemented}
            </p>
            <p className="text-slate-400">
              <span className="text-accent-lime">✓</span> {v.testsPassed}{" "}
              <span className="text-slate-600">(12/12)</span>
            </p>
            <p className="text-slate-400">
              <span className="text-accent-lime">✓</span> {v.qa}
            </p>
            <p className="text-slate-300">
              <span className="text-accent-violet">→</span> {v.openedPr}{" "}
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
