import { useState } from "react";

import { SectionTag } from "~/components/HowItWorks";
import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

const DIAGRAM_META = [
  { id: "system", src: "/diagrams/system-flow.svg" },
  { id: "testing", src: "/diagrams/testing-flow.svg" },
  { id: "qa", src: "/diagrams/qa-flow.svg" },
];

export function Diagrams() {
  const { t } = useT();
  const d = t.diagrams;
  const diagrams = DIAGRAM_META.map((m, i) => ({ ...m, ...d.items[i] }));
  const [active, setActive] = useState(diagrams[0].id);
  const current = diagrams.find((x) => x.id === active)!;

  return (
    <section
      id="diagrams"
      className="relative scroll-mt-20 border-y border-white/5 bg-ink-900/40 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <SectionTag>{d.tag}</SectionTag>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {d.heading}
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {d.intro}
          </p>
        </Reveal>

        <Reveal delay={80}>
          {/* Tabs */}
          <div
            role="tablist"
            aria-label={d.tablistAria}
            className="mt-10 inline-flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-ink-800/60 p-1"
          >
            {diagrams.map((dg) => (
              <button
                key={dg.id}
                role="tab"
                aria-selected={active === dg.id}
                onClick={() => setActive(dg.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  active === dg.id
                    ? "bg-accent text-white shadow-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {dg.tab}
              </button>
            ))}
          </div>

          {/* Panel */}
          <figure className="card mt-6 overflow-hidden">
            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-start">
              <figcaption className="order-2 lg:order-1 lg:max-w-xs">
                <h3 className="text-lg font-semibold text-white">
                  {current.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {current.caption}
                </p>
                <a
                  href={current.src}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-cyan hover:text-cyan-200"
                >
                  {d.openFull}
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
              </figcaption>

              <div className="order-1 max-h-[560px] overflow-auto rounded-xl bg-white p-4 lg:order-2 lg:w-[640px]">
                <img
                  key={current.id}
                  src={current.src}
                  alt={`${current.title} diagram`}
                  loading="lazy"
                  className="mx-auto h-auto w-full animate-fade-up"
                />
              </div>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
