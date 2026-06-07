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

// Architecture is a set of independent choices. `current` marks today's setup.
interface ArchOption {
  id: string;
  name: string;
  desc: string;
}
interface ArchGroup {
  key: "execution" | "agents" | "tenancy" | "platform";
  label: string;
  current: string;
  options: ArchOption[];
}

const ARCH_GROUPS: ArchGroup[] = [
  {
    key: "execution",
    label: "Execution",
    current: "inline",
    options: [
      { id: "inline", name: "Inline", desc: "Implement in-process and post to Jira. Cheapest, no PRs." },
      { id: "runner", name: "Isolated runner", desc: "Fargate per story — clones the repo, runs tests, opens a PR." },
    ],
  },
  {
    key: "agents",
    label: "Agents",
    current: "multi",
    options: [
      { id: "multi", name: "Multi-agent", desc: "Specialised agents hand off across stages." },
      { id: "single", name: "Single agent", desc: "One agent handles the whole story." },
    ],
  },
  {
    key: "tenancy",
    label: "Tenancy",
    current: "multi",
    options: [
      { id: "multi", name: "Multi-tenancy", desc: "One deployment serves many isolated tenants." },
      { id: "single", name: "Single-tenant", desc: "A dedicated deployment per customer." },
    ],
  },
  {
    key: "platform",
    label: "Platform",
    current: "aws-sst",
    options: [
      { id: "aws-sst", name: "AWS SST", desc: "Serverless AWS, defined with SST." },
      { id: "vercel", name: "Vercel", desc: "Dashboard and functions on Vercel." },
      { id: "azure", name: "Azure", desc: "Azure Container Apps + Functions." },
      { id: "custom", name: "Custom", desc: "Bring your own infrastructure." },
    ],
  },
];

type ArchSelection = Record<ArchGroup["key"], string>;
const ARCH_DEFAULT: ArchSelection = { execution: "inline", agents: "multi", tenancy: "multi", platform: "aws-sst" };

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

// AI engine per agent. Only Claude is available today; others are placeholders.
const ENGINES = [
  { id: "claude", name: "Claude", available: true },
  { id: "gpt", name: "OpenAI GPT", available: false },
  { id: "gemini", name: "Google Gemini", available: false },
];
const CLAUDE_MODELS = [
  { id: "sonnet", name: "Sonnet", note: "fast · lower cost" },
  { id: "opus", name: "Opus", note: "most capable" },
];

// The Jira-label handoff: each agent picks up issues with the incoming label and
// hands them on with the next. Mirrors src/agent.ts. `id` ties a node to its
// toggle in the Agents section; `fail` is the label a failed check routes back to.
type AgentRole = "processes" | "decides";
interface PipelineAgent {
  id: string;
  name: string;
  role: AgentRole;
  inLabel: string;
  outLabel: string;
  fail?: string;
  /** Rough est. LLM cost per story this agent runs on — each enabled agent adds to it. */
  cost: number;
}

// Ordered pipeline; the diagram is built from whichever of these are enabled.
const PIPELINE_FLOW: PipelineAgent[] = [
  { id: "reviser", name: "Reviser", role: "processes", inLabel: "revise", outLabel: "revised", cost: 0.02 },
  { id: "implementer", name: "Implementer", role: "processes", inLabel: "ready", outLabel: "implemented", cost: 0.14 },
  { id: "tester", name: "Tester", role: "decides", inLabel: "implemented", outLabel: "tested", fail: "tests-failed", cost: 0.05 },
  { id: "qa", name: "QA", role: "decides", inLabel: "tested", outLabel: "done", fail: "qa-failed", cost: 0.04 },
];

export default function Configure() {
  const { email, projects, selected, locked } = useLoaderData<typeof loader>();
  const [arch, setArch] = useState<ArchSelection>(ARCH_DEFAULT);
  const pickArch = (group: ArchGroup["key"], id: string) => setArch((a) => ({ ...a, [group]: id }));
  const [project, setProject] = useState<string>(selected);
  const [agents, setAgents] = useState<Record<string, boolean>>(
    Object.fromEntries(AGENTS.map((a) => [a.id, Boolean(a.on)])),
  );

  const toggle = (id: string) => setAgents((a) => ({ ...a, [id]: !a[id] }));
  const lockedName = projects.find((p) => p.projectId === selected)?.name;

  // Click an agent to configure its AI engine + model.
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [agentCfg, setAgentCfg] = useState<Record<string, { engine: string; model: string }>>(
    Object.fromEntries(AGENTS.map((a) => [a.id, { engine: "claude", model: "sonnet" }])),
  );
  const setCfg = (id: string, patch: Partial<{ engine: string; model: string }>) =>
    setAgentCfg((c) => ({ ...c, [id]: { ...c[id], ...patch } }));

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

        {/* Architecture — independent choices; the current setup is badged. */}
        <section className="mt-10">
          <Eyebrow>Architecture</Eyebrow>
          <div className="grid gap-6">
            {ARCH_GROUPS.map((group) => (
              <div key={group.key}>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {group.label}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {group.options.map((opt) => {
                    const active = arch[group.key] === opt.id;
                    const current = group.current === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => pickArch(group.key, opt.id)}
                        className={`card p-4 text-left transition-all ${active ? "!border-accent/60 ring-1 ring-accent/30" : "card-hover"}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-sm text-white">{opt.name}</strong>
                          {current && (
                            <span className="rounded-full bg-accent-lime/20 px-2 py-0.5 font-mono text-[10px] text-accent-lime">
                              current
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Agents — toggle to enable; click the body to configure engine/model. */}
        <section className="mt-10">
          <Eyebrow>Agents</Eyebrow>
          <div className="grid gap-3 sm:grid-cols-2">
            {AGENTS.map((ag) => {
              const on = agents[ag.id];
              const cfg = agentCfg[ag.id];
              const isCfg = configuring === ag.id;
              return (
                <div
                  key={ag.id}
                  className={`card flex items-center gap-4 p-4 transition-all ${on ? "" : "opacity-50"} ${isCfg ? "!border-accent/60 ring-1 ring-accent/30" : "card-hover"}`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(ag.id)}
                    aria-label={`${on ? "Disable" : "Enable"} ${ag.name}`}
                    className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${on ? "bg-accent" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                  <button type="button" onClick={() => setConfiguring(ag.id)} className="min-w-0 flex-1 text-left">
                    <strong className="text-white">{ag.name}</strong>
                    <span className="block truncate text-xs text-slate-400">{ag.desc}</span>
                    <span className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-accent">
                      {cfg.engine} · {cfg.model} <span className="text-slate-600">· configure</span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Engine/model configurator for the clicked agent. */}
          {configuring &&
            (() => {
              const ag = AGENTS.find((a) => a.id === configuring);
              if (!ag) return null;
              const cfg = agentCfg[configuring];
              return (
                <div className="card mt-4 p-5">
                  <div className="flex items-center justify-between">
                    <strong className="text-white">Configure · {ag.name}</strong>
                    <button
                      type="button"
                      onClick={() => setConfiguring(null)}
                      className="text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Done
                    </button>
                  </div>

                  <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">AI engine</div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {ENGINES.map((e) => {
                      const active = cfg.engine === e.id;
                      return (
                        <button
                          key={e.id}
                          type="button"
                          disabled={!e.available}
                          onClick={() => setCfg(configuring, { engine: e.id })}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            active ? "border-accent/60 bg-accent/10" : "border-white/10"
                          } ${e.available ? "hover:border-white/30" : "cursor-not-allowed opacity-50"}`}
                        >
                          <div className="text-sm font-semibold text-white">{e.name}</div>
                          <div className="font-mono text-[10px] text-slate-400">{e.available ? "available" : "coming soon"}</div>
                        </button>
                      );
                    })}
                  </div>

                  {cfg.engine === "claude" && (
                    <>
                      <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Model</div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {CLAUDE_MODELS.map((m) => {
                          const active = cfg.model === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setCfg(configuring, { model: m.id })}
                              className={`rounded-xl border p-3 text-left transition-all ${
                                active ? "border-accent/60 bg-accent/10" : "border-white/10 hover:border-white/30"
                              }`}
                            >
                              <div className="text-sm font-semibold text-white">{m.name}</div>
                              <div className="font-mono text-[10px] text-slate-400">{m.note}</div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
        </section>

        {/* Agent handoff — how work passes between agents via Jira labels. */}
        <section className="mt-10">
          <Eyebrow>Agent handoff</Eyebrow>
          <HandoffDiagram agents={agents} />
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

// ---- Agent handoff diagram -------------------------------------------------
// A left → right chain: Jira labels (pills) and agents (cards) connected by
// arrows. Each agent shows whether it PROCESSES (transforms) or DECIDES
// (pass/fail); a decider's failure label is shown routing back.

function HandoffDiagram({ agents }: { agents: Record<string, boolean> }) {
  const active = PIPELINE_FLOW.filter((a) => agents[a.id]);
  const totalCost = active.reduce((s, a) => s + a.cost, 0);

  if (active.length === 0) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-500">No agents enabled — turn some on above to build the flow.</p>
      </div>
    );
  }

  const Label = ({ text }: { text: string }) => (
    <span className="inline-flex shrink-0 items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">
      #{text}
    </span>
  );
  const Arrow = () => <span aria-hidden className="shrink-0 text-lg text-slate-600">→</span>;

  return (
    <div className="card overflow-x-auto p-6">
      <div className="flex min-w-max items-center gap-2">
        {/* The first enabled agent's incoming label starts the chain. */}
        <Label text={active[0].inLabel} />
        {active.map((a) => {
          const decides = a.role === "decides";
          return (
            <div key={a.id} className="flex items-center gap-2">
              <Arrow />
              <span
                className={`grid place-items-center rounded-xl border px-3.5 py-2 text-center ${
                  decides ? "border-accent-violet/50 bg-accent-violet/10" : "border-accent/50 bg-accent/10"
                }`}
              >
                <span className="text-sm font-semibold text-white">{a.name}</span>
                <span
                  className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] ${
                    decides ? "bg-accent-violet/20 text-accent-violet" : "bg-accent/20 text-accent"
                  }`}
                >
                  {a.role}
                </span>
                <span className="mt-1 font-mono text-[10px] text-slate-400">~${a.cost.toFixed(2)}/story</span>
                {a.fail && (
                  <span className="mt-1 font-mono text-[10px] text-red-300/80">✗ ↻ #{a.fail}</span>
                )}
              </span>
              <Arrow />
              {/* The label this agent hands off. */}
              <Label text={a.outLabel} />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> processes — transforms the work
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-violet" /> decides — pass/fail gate
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-red-300/80">✗ ↻</span> failure routes back with that label
        </span>
        <span className="ml-auto rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-mono text-slate-200">
          {active.length} agents · ~${totalCost.toFixed(2)}/story
        </span>
      </div>
    </div>
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
