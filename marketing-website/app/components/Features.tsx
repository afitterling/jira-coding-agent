import { SectionTag } from "~/components/HowItWorks";
import { LabelPill } from "~/components/LabelPill";
import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

type FeatureMeta = {
  icon: React.ReactNode;
  span?: boolean;
  highlight?: boolean;
};

const FEATURE_META: FeatureMeta[] = [
  { icon: <RobotIcon />, span: true, highlight: true },
  { icon: <JiraIcon /> },
  { icon: <FlaskIcon /> },
  { icon: <ShieldIcon />, span: true },
  { icon: <GaugeIcon /> },
  { icon: <GitIcon /> },
];

export function Features() {
  const { t } = useT();
  const fc = t.features;
  const features = FEATURE_META.map((m, i) => ({ ...m, ...fc.items[i] }));
  return (
    <section id="features" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <SectionTag>{fc.tag}</SectionTag>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {fc.heading}
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {fc.intro}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i % 3) * 80}
              className={f.span ? "sm:col-span-2 lg:col-span-2" : ""}
            >
              <article
                className={`group relative h-full overflow-hidden rounded-2xl p-6 shadow-card backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 ${
                  f.highlight
                    ? "border border-accent/40 bg-gradient-to-br from-accent/[0.12] via-accent-violet/[0.06] to-transparent"
                    : "border border-white/10 bg-white/[0.03]"
                }`}
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl transition-opacity duration-300 ${
                    f.highlight
                      ? "bg-accent/20 opacity-100"
                      : "bg-accent/10 opacity-0 group-hover:opacity-100"
                  }`}
                />
                {f.highlight && (
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-indigo-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-lime" />
                    {fc.badge}
                  </span>
                )}
                <div
                  className={`mb-4 grid h-11 w-11 place-items-center rounded-xl border border-white/10 ${
                    f.highlight
                      ? "bg-accent/20 text-white"
                      : "bg-ink-800 text-accent-cyan"
                  }`}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {f.body}
                </p>
                {f.bullets.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {f.bullets.map((b) => (
                      <li key={b}>
                        <LabelPill tone={f.highlight ? "implemented" : "neutral"}>
                          {b}
                        </LabelPill>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- icons ---- */
const ic = "h-6 w-6";
const sp = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function RobotIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M12 4v4M8 13h.01M16 13h.01M9 16h6" />
      <path d="M2 12v3M22 12v3" />
    </svg>
  );
}
function JiraIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <path d="M12 2l8 8-8 8-8-8 8-8z" />
      <path d="M12 7l3 3-3 3-3-3 3-3z" />
    </svg>
  );
}
function FlaskIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3" />
      <path d="M7.5 15h9" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M12 8v4M12 15h.01" />
    </svg>
  );
}
function GaugeIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <path d="M4 18a8 8 0 1116 0" />
      <path d="M12 18l4-5" />
      <circle cx="12" cy="18" r="1.3" />
    </svg>
  );
}
function GitIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ic} {...sp}>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="12" r="2.2" />
      <path d="M6 8.2v7.6M8.1 6.6c4 .3 7.6 1.4 7.9 5.2" />
    </svg>
  );
}
