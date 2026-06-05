import { SectionTag } from "~/components/HowItWorks";
import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

export function About() {
  const { t } = useT();
  const a = t.about;
  return (
    <section id="about" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionTag>{a.tag}</SectionTag>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {a.headingLead}
              <span className="text-gradient">{a.headingName}</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              <span className="font-semibold text-slate-200">
                {a.leadName}
              </span>
              {a.leadRest}
            </p>
            <p className="mt-4 leading-relaxed text-slate-400">
              {a.p2}
            </p>
            <p className="mt-4 leading-relaxed text-slate-400">
              {a.p3a}
              <span className="font-medium text-indigo-200">
                {a.p3focus}
              </span>
              {a.p3b}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="https://sp33c.tech" target="_blank" rel="noreferrer" className="btn-primary">
                {a.ctaVisit}
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                  <path
                    d="M7 4h9v9M16 4 7 13M4 8v8h8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a href="mailto:info@sp33c.tech" className="btn-ghost">
                {a.ctaEmail}
              </a>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">
                {a.focusTitle}
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {a.focus.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-slate-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7 border-t border-white/10 pt-5 text-sm text-slate-500">
                <p className="text-slate-400">{a.location}</p>
                <p className="mt-0.5">
                  {a.locationSpread}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
