import { LabelPill } from "~/components/LabelPill";
import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

type StepMeta = {
  n: string;
  pill?: React.ReactNode;
  icon: React.ReactNode;
};

const STEP_META: StepMeta[] = [
  { n: "01", icon: <PenIcon /> },
  { n: "02", pill: <LabelPill tone="ready">#ready</LabelPill>, icon: <TagIcon /> },
  { n: "03", icon: <BoltIcon /> },
  {
    n: "04",
    pill: (
      <span className="flex flex-wrap gap-1.5">
        <LabelPill tone="implemented">#implemented</LabelPill>
        <LabelPill tone="tested">#tested</LabelPill>
      </span>
    ),
    icon: <CheckShieldIcon />,
  },
  { n: "05", icon: <BranchIcon /> },
  { n: "06", pill: <LabelPill tone="done">#qa-passed → #done</LabelPill>, icon: <EyeIcon /> },
];

export function HowItWorks() {
  const { t } = useT();
  const h = t.howItWorks;
  const steps = STEP_META.map((m, i) => ({ ...m, ...h.steps[i] }));
  return (
    <section id="how" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <SectionTag>{h.tag}</SectionTag>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {h.heading}
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {h.intro}
          </p>
        </Reveal>

        {/* Linear flow rail */}
        <div className="relative mt-16">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-accent/0 via-accent/40 to-accent-cyan/0 lg:block"
          />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.n} delay={i * 80}>
                <div className="group relative flex h-full flex-col">
                  <div className="relative z-10 mb-5 flex items-center gap-3">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-ink-800 text-accent shadow-card transition-colors group-hover:border-accent/40 group-hover:text-accent-cyan">
                      {step.icon}
                    </span>
                    <span className="font-mono text-xs text-slate-600 lg:hidden">
                      {step.n}
                    </span>
                  </div>
                  <span className="mb-1 hidden font-mono text-xs text-slate-600 lg:block">
                    {step.n}
                  </span>
                  <h3 className="text-base font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {step.body}
                  </p>
                  {step.pill && <div className="mt-3">{step.pill}</div>}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Revise loop callout */}
        <Reveal delay={120}>
          <div className="card mt-12 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300">
                <LoopIcon />
              </span>
              <div>
                <h3 className="font-semibold text-white">
                  {h.reviseTitle}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {h.reviseP1}
                  <LabelPill tone="revise">#revise</LabelPill>
                  {h.reviseP2}
                  <LabelPill tone="neutral">#undone</LabelPill>
                  {h.reviseP3}
                  <LabelPill tone="revised">#revised</LabelPill>
                  {h.reviseP4}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-widest text-accent">
      <span className="h-px w-6 bg-accent" />
      {children}
    </span>
  );
}

/* ---- inline icons (no dependency, crisp at any size) ---- */
const ic = "h-6 w-6";
const sp = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <path d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <path d="M4 4h7l9 9-7 7-9-9V4z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
    </svg>
  );
}
function CheckShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function BranchIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="8" r="2.2" />
      <path d="M6 8.2v7.6M6 12c0-3 1-4 5-4" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}
function LoopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" {...sp}>
      <path d="M4 9a8 8 0 0114-3l2 2M20 15a8 8 0 01-14 3l-2-2" />
      <path d="M20 4v4h-4M4 20v-4h4" />
    </svg>
  );
}
