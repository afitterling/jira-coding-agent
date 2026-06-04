import { Reveal } from "~/components/Reveal";

const CASES: { glyph: string; title: string; body: string; dot: string }[] = [
  {
    glyph: "</>",
    title: "Agentic coding",
    body: "The flagship: a Jira story labelled #ready becomes a tested, QA'd, reviewed pull request.",
    dot: "bg-accent",
  },
  {
    glyph: "$",
    title: "Investing & capital markets",
    body: "Screen, research, and analyse opportunities — ethical investing and market intelligence, agents gathering and reasoning over the data.",
    dot: "bg-accent-lime",
  },
  {
    glyph: "⤳",
    title: "Workflows beyond",
    body: "Any label-driven workflow — ops, compliance, content, research. Model the states as labels and let agents drive them, human-gated.",
    dot: "bg-accent-violet",
  },
  {
    glyph: "▦",
    title: "Store & analyse",
    body: "Every run and artifact is persisted — query it, dashboard it, and analyse outcomes over time to sharpen the next run.",
    dot: "bg-accent-cyan",
  },
];

export function UseCases() {
  return (
    <section
      id="use-cases"
      className="relative scroll-mt-20 border-b border-white/5 py-24 sm:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-lime" />
              Beyond coding
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              One agentic engine. <span className="text-gradient">Any mission.</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400">
              The same label-driven, human-in-the-loop loop that ships code can
              run investment research, data pipelines, and back-office workflows
              — then store and analyse everything it produces.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CASES.map((c, i) => (
            <Reveal key={c.title} delay={i * 70}>
              <div className="card group h-full p-6 transition-colors hover:border-white/20">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${c.dot} font-mono text-sm font-bold text-ink-950 shadow-glow`}
                >
                  {c.glyph}
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
