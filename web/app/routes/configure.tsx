import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getUser } from "~/lib/auth.server";
import { AppHeader, Eyebrow, NavLink } from "~/lib/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/login");
  return json({ email: user.email });
}

// NOTE: This page is a design preview — selections are not yet persisted or wired
// to the agent. It exists to shape the configuration experience (see AS-49).

const ARCHITECTURES = [
  { id: "inline", name: "Inline", tag: "single Lambda", desc: "The cron implements stories in-process. Cheapest and fastest to start — no isolation, no PRs." },
  { id: "fargate", name: "Isolated runner", tag: "Fargate · per story", desc: "Each story runs Claude Code in its own microVM: clones the repo, runs tests, opens a PR." },
  { id: "multi", name: "Multi-agent pipeline", tag: "specialised agents", desc: "Distinct agents hand off across the pipeline for higher quality on complex work." },
] as const;

const AGENTS = [
  { id: "reviser", name: "Reviser", stage: "Revise", desc: "Turns a raw story into a crisp, testable spec." },
  { id: "implementer", name: "Implementer", stage: "Implement", desc: "Writes the code for a ready story." },
  { id: "tester", name: "Tester", stage: "Test", desc: "Derives and runs the test cases." },
  { id: "qa", name: "QA", stage: "QA", desc: "Checks completeness, edge cases, regressions." },
  { id: "reviewer", name: "Reviewer", stage: "PR", desc: "Final review before the PR is opened." },
] as const;

type AgentId = (typeof AGENTS)[number]["id"];

export default function Configure() {
  const { email } = useLoaderData<typeof loader>();
  const [arch, setArch] = useState<string>("fargate");
  const [agents, setAgents] = useState<Record<AgentId, boolean>>({
    reviser: true,
    implementer: true,
    tester: true,
    qa: true,
    reviewer: false,
  });

  const toggle = (id: AgentId) => setAgents((a) => ({ ...a, [id]: !a[id] }));

  return (
    <>
      <AppHeader
        right={
          <>
            <NavLink href="/">Runs</NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavLink href="/costs">Costs</NavLink>
            <span className="hidden text-sm text-slate-500 sm:inline">{email}</span>
            <a href="/logout" className="btn-ghost !px-3.5 !py-2">Log out</a>
          </>
        }
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-slate-300">
          preview · not yet wired
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Configure your <span className="text-gradient">agent</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Choose how the system runs, which agents take part, and how work flows between them.
        </p>

        {/* Architecture */}
        <section className="mt-10">
          <Eyebrow>Architecture</Eyebrow>
          <div className="grid gap-3 sm:grid-cols-3">
            {ARCHITECTURES.map((a) => {
              const active = arch === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setArch(a.id)}
                  className={`card p-5 text-left transition-all ${active ? "!border-accent/60 ring-1 ring-accent/30" : "card-hover"}`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-white">{a.name}</strong>
                    <span className={`h-3 w-3 rounded-full border ${active ? "border-accent bg-accent" : "border-white/20"}`} />
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-accent">{a.tag}</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{a.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Agents */}
        <section className="mt-10">
          <Eyebrow>Agents</Eyebrow>
          <div className="grid gap-3 sm:grid-cols-2">
            {AGENTS.map((ag) => {
              const on = agents[ag.id];
              return (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => toggle(ag.id)}
                  className={`card flex items-center gap-4 p-4 text-left transition-all ${on ? "" : "opacity-50"} card-hover`}
                >
                  <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${on ? "bg-accent" : "bg-white/10"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
                  </span>
                  <span className="min-w-0">
                    <strong className="text-white">{ag.name}</strong>
                    <span className="block truncate text-xs text-slate-400">{ag.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Flow */}
        <section className="mt-10">
          <Eyebrow>Flow</Eyebrow>
          <div className="card flex flex-wrap items-center gap-2 p-6">
            {AGENTS.map((ag, i) => {
              const on = agents[ag.id];
              return (
                <span key={ag.id} className="flex items-center gap-2">
                  <span
                    className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${on ? "border-accent/40 bg-accent/10 text-slate-100" : "border-white/10 text-slate-600 line-through"}`}
                  >
                    {ag.stage}
                  </span>
                  {i < AGENTS.length - 1 && <span className="text-slate-600">→</span>}
                </span>
              );
            })}
          </div>
        </section>

        <div className="mt-10 flex items-center gap-3">
          <button type="button" disabled className="btn-primary" title="Preview only">
            Save configuration
          </button>
          <span className="text-xs text-slate-500">Preview only — wiring comes in a later story.</span>
        </div>
      </main>
    </>
  );
}
