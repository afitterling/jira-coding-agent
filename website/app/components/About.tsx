import { SectionTag } from "~/components/HowItWorks";
import { Reveal } from "~/components/Reveal";

const FOCUS = [
  "Agentic & Generative AI",
  "AI Agents & Orchestration",
  "LLMs & Prompt Engineering",
  "Security Architecture & Cyber Security",
  "Cloud-native Engineering",
  "Critical Infrastructure & KRITIS Energy",
];

export function About() {
  return (
    <section id="about" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionTag>Who builds this</SectionTag>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Made by{" "}
              <span className="text-gradient">sp33c</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              <span className="font-semibold text-slate-200">
                Alex Fitterling
              </span>{" "}
              is an engineer and architect with deep expertise across Cyber
              Security, Security Architecture, AI, Cloud, and DevOps —
              designing and delivering secure, scalable solutions for private
              and public sector clients.
            </p>
            <p className="mt-4 leading-relaxed text-slate-400">
              His focus on{" "}
              <span className="font-medium text-indigo-200">
                Agentic &amp; Generative AI
              </span>{" "}
              — AI agents, orchestration, and LLM-driven systems — is exactly
              what powers this project: an autonomous coding agent that turns a
              Jira backlog into reviewed, shipped code.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="https://sp33c.tech" target="_blank" rel="noreferrer" className="btn-primary">
                Visit sp33c.tech
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
                info@sp33c.tech
              </a>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">
                Focus areas
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {FOCUS.map((f) => (
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
                <p className="text-slate-400">Nuremberg, Germany</p>
                <p className="mt-0.5">
                  Across Switzerland · Singapore · Malaysia · Germany
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
