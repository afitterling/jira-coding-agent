import { Reveal } from "~/components/Reveal";

/** A pluggable model backend the agent can drive. */
const INTERFACES: {
  name: string;
  tag: string;
  body: string;
  accent: string; // ring/text colour
  dot: string;
}[] = [
  {
    name: "Anthropic Claude",
    tag: "default",
    body: "Claude Opus drives the agent out of the box — the sharpest coding model for spec-to-PR work.",
    accent: "ring-accent/30 text-indigo-300",
    dot: "bg-accent",
  },
  {
    name: "AWS Bedrock",
    tag: "managed",
    body: "Route to Bedrock for Claude, Llama, or Mistral inside your own AWS account, VPC, and compliance boundary.",
    accent: "ring-amber-400/30 text-amber-300",
    dot: "bg-amber-400",
  },
  {
    name: "LM Studio",
    tag: "local",
    body: "Point the agent at a local LM Studio endpoint — fully offline. Your code and prompts never leave the building.",
    accent: "ring-accent-cyan/30 text-cyan-300",
    dot: "bg-accent-cyan",
  },
];

export function Interfaces() {
  return (
    <section
      id="interfaces"
      className="relative scroll-mt-20 border-b border-white/5 py-24 sm:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/3 top-1/4 h-[340px] w-[680px] rounded-full bg-accent-cyan/[0.05] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
              AI Interfaces
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Plug in <span className="text-gradient">any model.</span>
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400">
              The agent is model-agnostic. Run frontier Claude in the cloud,
              keep everything inside your AWS account with Bedrock, or go fully
              local with LM Studio — same pipeline, your choice of brain.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTERFACES.map((it, i) => (
            <Reveal key={it.name} delay={i * 80}>
              <div className="card group h-full p-6 transition-colors hover:border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${it.dot} shadow-glow`} />
                    <h3 className="text-base font-semibold text-white">{it.name}</h3>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ring-1 ring-inset ${it.accent}`}
                  >
                    {it.tag}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{it.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Fargate isolation callout */}
        <Reveal delay={120}>
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-accent-violet/25 bg-gradient-to-br from-accent-violet/10 via-transparent to-accent/5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-violet/15 text-accent-violet ring-1 ring-inset ring-accent-violet/30">
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                  <path
                    d="M10 2l7 4v8l-7 4-7-4V6l7-4Zm0 0v16M3 6l7 4 7-4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Every agent runs isolated on AWS Fargate
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">
                  Each story is implemented in its own ephemeral Fargate microVM —
                  separate compute, filesystem, and credentials. No shared state
                  between runs or tenants.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 font-mono text-[11px]">
              <span className="rounded-md bg-white/5 px-2 py-1 text-slate-300 ring-1 ring-inset ring-white/10">
                1 microVM / story
              </span>
              <span className="rounded-md bg-white/5 px-2 py-1 text-slate-300 ring-1 ring-inset ring-white/10">
                scale to zero
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
