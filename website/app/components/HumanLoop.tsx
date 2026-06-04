import { LabelPill } from "~/components/LabelPill";
import { Reveal } from "~/components/Reveal";

/** A human checkpoint in the otherwise-autonomous pipeline. */
const TOUCHPOINTS: {
  step: string;
  title: string;
  body: string;
  pill?: React.ReactNode;
}[] = [
  {
    step: "01",
    title: "Approve the spec",
    body: "The agent rewrites each story into testable acceptance criteria. You read the revised spec before it goes anywhere.",
    pill: <LabelPill tone="revised">#revised</LabelPill>,
  },
  {
    step: "02",
    title: "Open the gate",
    body: "Nothing gets built until a human labels it. The #ready label is your explicit go — autonomy starts only when you say so.",
    pill: <LabelPill tone="ready">#ready</LabelPill>,
  },
  {
    step: "03",
    title: "Review the PR",
    body: "Every change lands as a pull request, never a direct push. You merge — or you don't. The agent ships nothing on its own.",
    pill: <LabelPill tone="implemented">#implemented</LabelPill>,
  },
  {
    step: "04",
    title: "Override QA",
    body: "Test and QA gates run automatically, but their verdict is advisory. Your call beats the model's every time.",
    pill: <LabelPill tone="qa">#qa-passed</LabelPill>,
  },
  {
    step: "05",
    title: "Pull the cord",
    body: "Drop a label to pause, re-route, or kill a story mid-flight. The loop reacts on the next 2-minute tick.",
    pill: <LabelPill tone="failed">#hold</LabelPill>,
  },
];

export function HumanLoop() {
  return (
    <section
      id="loop"
      className="relative scroll-mt-20 border-b border-white/5 py-24 sm:py-32"
    >
      {/* soft backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-accent-violet/[0.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-violet/30 bg-accent-violet/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-violet-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-violet opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-violet" />
              </span>
              Human-Agentic Support
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Autonomy you can <span className="text-gradient">veto.</span>
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400">
              A man in the loop, by design. The agent does the relentless work —
              reading, revising, coding, testing — but a human owns every
              irreversible decision. Five checkpoints keep you in command without
              slowing the machine down.
            </p>
          </Reveal>
        </div>

        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOUCHPOINTS.map((t, i) => (
            <Reveal as="li" key={t.step} delay={i * 70}>
              <div className="card group relative h-full overflow-hidden p-6 transition-colors hover:border-white/20">
                <div className="absolute -right-4 -top-5 font-mono text-7xl font-bold text-white/[0.04] transition-colors group-hover:text-white/[0.06]">
                  {t.step}
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent-violet shadow-glow" />
                    <h3 className="text-base font-semibold text-white">{t.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{t.body}</p>
                  {t.pill && <div className="mt-4">{t.pill}</div>}
                </div>
              </div>
            </Reveal>
          ))}

          {/* closing statement card */}
          <Reveal as="li" delay={TOUCHPOINTS.length * 70}>
            <div className="relative flex h-full flex-col justify-center rounded-2xl border border-accent-violet/25 bg-gradient-to-br from-accent-violet/10 via-transparent to-accent/5 p-6">
              <p className="text-sm font-medium leading-relaxed text-slate-200">
                The agent is the workforce. <br />
                <span className="text-gradient text-lg font-bold">You stay the
                decision-maker.</span>
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                ship at machine speed · approve at human judgement
              </p>
            </div>
          </Reveal>
        </ol>
      </div>
    </section>
  );
}
