import { AgentFlow } from "~/components/AgentFlow";
import { SectionTag } from "~/components/HowItWorks";
import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

export function Diagrams() {
  const { t } = useT();
  const d = t.diagrams;

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
          {/* The live agent-handoff graph from the app's configure page. */}
          <AgentFlow />
        </Reveal>
      </div>
    </section>
  );
}
