import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useRef, useState } from "react";
import { getUser } from "~/lib/auth.server";
import { listProjects } from "~/lib/projects.server";
import { AppHeader, Eyebrow, NavLink } from "~/lib/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/login");
  const projects = await listProjects(user.email);
  // A ?project= means we arrived from a specific project → lock to it (no picker).
  // No param means we came from the menu → let the user pick which project.
  const fromProject = new URL(request.url).searchParams.get("project");
  const locked = Boolean(fromProject);
  const selected = fromProject ?? projects[0]?.projectId ?? "";
  return json({ email: user.email, projects, selected, locked });
}

// NOTE: This page is a design preview — selections are not yet persisted or wired
// to the agent. It exists to shape the configuration experience (see AS-49).

const ARCHITECTURES = [
  { id: "inline", name: "Inline", tag: "single Lambda", desc: "The cron implements stories in-process. Cheapest and fastest to start — no isolation, no PRs." },
  { id: "fargate", name: "Isolated runner", tag: "Fargate · per story", desc: "Each story runs Claude Code in its own microVM: clones the repo, runs tests, opens a PR." },
  { id: "multi", name: "Multi-agent pipeline", tag: "specialised agents", desc: "Distinct agents hand off across the pipeline for higher quality on complex work." },
] as const;

interface AgentDef {
  id: string;
  name: string;
  desc: string;
  /** Pipeline stage label — shown in the Flow row. Advisor agents have none. */
  stage?: string;
  /** Enabled by default. */
  on?: boolean;
}

const AGENTS: AgentDef[] = [
  { id: "reviser", name: "Reviser", stage: "Revise", desc: "Turns a raw story into a crisp, testable spec.", on: true },
  { id: "implementer", name: "Implementer", stage: "Implement", desc: "Writes the code for a ready story.", on: true },
  { id: "tester", name: "Tester", stage: "Test", desc: "Derives and runs the test cases.", on: true },
  { id: "qa", name: "QA", stage: "QA", desc: "Checks completeness, edge cases, regressions.", on: true },
  { id: "reviewer", name: "Reviewer", stage: "PR", desc: "Final review before the PR is opened." },
  { id: "risk", name: "Risk Assessment", desc: "Flags delivery, security, and compliance risk in a story." },
  { id: "financial-advisor", name: "Financial Advisor", desc: "Weighs cost/benefit and ROI of the proposed work." },
  { id: "cfo-assistant", name: "CFO assistant", desc: "Tracks budget impact and spend against the plan." },
];

export default function Configure() {
  const { email, projects, selected, locked } = useLoaderData<typeof loader>();
  const [arch, setArch] = useState<string>("fargate");
  const [project, setProject] = useState<string>(selected);
  const [agents, setAgents] = useState<Record<string, boolean>>(
    Object.fromEntries(AGENTS.map((a) => [a.id, Boolean(a.on)])),
  );

  const toggle = (id: string) => setAgents((a) => ({ ...a, [id]: !a[id] }));
  const lockedName = projects.find((p) => p.projectId === selected)?.name;

  return (
    <>
      <AppHeader
        right={
          <>
            <NavLink href="/">Runs</NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavLink href="/costs">Costs</NavLink>
            <a href="/profile" className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:inline">{email}</a>
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

        {/* Which project this configuration is for.
            From the menu → pick one; from a project's Configure button → locked. */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="field-label">Project</span>
          {locked ? (
            <span className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-slate-100">
              {lockedName ?? selected}
            </span>
          ) : projects.length === 0 ? (
            <Link to="/projects" className="text-sm text-accent hover:text-accent-violet">
              No projects yet — add one first →
            </Link>
          ) : (
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="field !w-auto !py-2 font-mono"
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId} className="bg-ink-900">
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

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

        {/* Flow editor — editable states, tags, links, and a mock data source. */}
        <section className="mt-10">
          <Eyebrow>Flow</Eyebrow>
          <FlowEditor />
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

// ---- Flow editor -----------------------------------------------------------
// A faked, interactive editor: states are nodes you can rename/reorder/remove,
// each carries tags, nodes are linked top → bottom, and a data node mocks
// "connect & read data".

interface FlowNode {
  id: string;
  label: string;
  kind: "data" | "state";
  tags: string[];
  connected?: boolean;
}

const FAKE_ROWS = [
  "FIN-101 · Add invoice CSV export · #ready",
  "FIN-104 · Reconcile ledger nightly · #revise",
  "FIN-108 · VAT rule engine · #implemented",
];

function FlowEditor() {
  const nextId = useRef(1);
  const [nodes, setNodes] = useState<FlowNode[]>([
    { id: "data", label: "Jira data", kind: "data", tags: ["source", "jira"], connected: false },
    { id: "revise", label: "Revise", kind: "state", tags: ["spec"] },
    { id: "implement", label: "Implement", kind: "state", tags: ["code"] },
    { id: "test", label: "Test", kind: "state", tags: ["verify"] },
    { id: "qa", label: "QA", kind: "state", tags: ["review"] },
    { id: "pr", label: "PR", kind: "state", tags: ["output"] },
  ]);

  const patch = (id: string, fn: (n: FlowNode) => FlowNode) =>
    setNodes((ns) => ns.map((n) => (n.id === id ? fn(n) : n)));
  const add = (kind: "data" | "state") =>
    setNodes((ns) => [
      ...ns,
      { id: `n${nextId.current++}`, label: kind === "data" ? "Data source" : "New state", kind, tags: [] },
    ]);
  const remove = (id: string) => setNodes((ns) => ns.filter((n) => n.id !== id));
  const move = (id: string, dir: -1 | 1) =>
    setNodes((ns) => {
      const i = ns.findIndex((n) => n.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= ns.length) return ns;
      const copy = [...ns];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => add("state")} className="btn-ghost !px-3 !py-1.5 !text-xs">+ State</button>
        <button type="button" onClick={() => add("data")} className="btn-ghost !px-3 !py-1.5 !text-xs">+ Data source</button>
        <span className="ml-auto text-xs text-slate-500">{nodes.length} states · linked top → bottom</span>
      </div>

      <div className="flex flex-col">
        {nodes.map((n, i) => (
          <div key={n.id}>
            <div className={`rounded-xl border p-4 ${n.kind === "data" ? "border-accent-cyan/30 bg-accent-cyan/5" : "border-white/10 bg-white/[0.03]"}`}>
              <div className="flex items-center gap-2">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md font-mono text-xs ${n.kind === "data" ? "bg-accent-cyan/20 text-accent-cyan" : "bg-accent/20 text-accent"}`}>
                  {n.kind === "data" ? "DB" : i}
                </span>
                <input
                  value={n.label}
                  onChange={(e) => patch(n.id, (x) => ({ ...x, label: e.target.value }))}
                  className="field !w-auto flex-1 !py-1.5 font-semibold !text-white"
                />
                <button type="button" onClick={() => move(n.id, -1)} className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400 hover:bg-white/5" aria-label="Move up">↑</button>
                <button type="button" onClick={() => move(n.id, 1)} className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400 hover:bg-white/5" aria-label="Move down">↓</button>
                <button type="button" onClick={() => remove(n.id)} className="rounded-md border border-red-400/25 px-2 py-1 text-xs text-red-300 hover:bg-red-400/10" aria-label="Remove">✕</button>
              </div>

              {/* tags */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {n.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-300">
                    #{t}
                    <button
                      type="button"
                      onClick={() => patch(n.id, (x) => ({ ...x, tags: x.tags.filter((y) => y !== t) }))}
                      className="text-slate-500 hover:text-white"
                      aria-label={`Remove tag ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <TagAdder onAdd={(t) => patch(n.id, (x) => (x.tags.includes(t) ? x : { ...x, tags: [...x.tags, t] }))} />
              </div>

              {/* data node: faked connect + read */}
              {n.kind === "data" && (
                <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => patch(n.id, (x) => ({ ...x, connected: !x.connected }))}
                      className="btn-ghost !px-3 !py-1.5 !text-xs"
                    >
                      {n.connected ? "Disconnect" : "Connect & read data"}
                    </button>
                    <span className={`text-xs ${n.connected ? "text-emerald-300" : "text-slate-500"}`}>
                      {n.connected ? "connected · reading (mock)" : "not connected"}
                    </span>
                  </div>
                  {n.connected && (
                    <ul className="mt-2 space-y-1 font-mono text-[11px] text-slate-400">
                      {FAKE_ROWS.map((r) => (
                        <li key={r}>· {r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* link to the next node */}
            {i < nodes.length - 1 && (
              <div className="flex items-center gap-2 py-1.5 pl-4 text-slate-600">
                <span className="text-sm">↓</span>
                <span className="font-mono text-[10px] uppercase tracking-wider">linked</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TagAdder({ onAdd }: { onAdd: (tag: string) => void }) {
  const [v, setV] = useState("");
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const t = v.trim().replace(/^#/, "");
          if (t) onAdd(t);
          setV("");
        }
      }}
      placeholder="+ tag"
      className="w-20 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:border-accent/50 focus:outline-none"
    />
  );
}
