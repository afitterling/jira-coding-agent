import { useState } from "react";

import { SectionTag } from "~/components/HowItWorks";
import { Reveal } from "~/components/Reveal";

type Diagram = {
  id: string;
  tab: string;
  title: string;
  caption: string;
  src: string;
};

const DIAGRAMS: Diagram[] = [
  {
    id: "system",
    tab: "System flow",
    title: "The end-to-end pipeline",
    caption:
      "Authenticate → fetch the board → revise specs → execute #ready stories → label + open PR → report. The full label-driven loop the agent runs every cron tick.",
    src: "/diagrams/system-flow.svg",
  },
  {
    id: "testing",
    tab: "Testing sub-flow",
    title: "The testing gate",
    caption:
      "After #implemented, the agent derives test cases from the acceptance criteria and judges the implementation — passing to #tested, failing to #tests-failed.",
    src: "/diagrams/testing-flow.svg",
  },
  {
    id: "qa",
    tab: "QA sub-flow",
    title: "The QA gate",
    caption:
      "A #tested story is validated for completeness, edge cases, and regressions — promoted to #qa-passed + #done, or sent back as #qa-failed.",
    src: "/diagrams/qa-flow.svg",
  },
];

export function Diagrams() {
  const [active, setActive] = useState(DIAGRAMS[0].id);
  const current = DIAGRAMS.find((d) => d.id === active)!;

  return (
    <section
      id="diagrams"
      className="relative scroll-mt-20 border-y border-white/5 bg-ink-900/40 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <SectionTag>Architecture, in diagrams</SectionTag>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            No black box. Every gate is mapped.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            These are the actual flow diagrams that ship in the repo — the same
            logic the agentic pipeline executes on each run.
          </p>
        </Reveal>

        <Reveal delay={80}>
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Flow diagrams"
            className="mt-10 inline-flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-ink-800/60 p-1"
          >
            {DIAGRAMS.map((d) => (
              <button
                key={d.id}
                role="tab"
                aria-selected={active === d.id}
                onClick={() => setActive(d.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  active === d.id
                    ? "bg-accent text-white shadow-glow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {d.tab}
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
                  Open full diagram
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
