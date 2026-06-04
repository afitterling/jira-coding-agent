import { SectionTag } from "~/components/HowItWorks";
import { LabelPill } from "~/components/LabelPill";
import { Reveal } from "~/components/Reveal";

export function Screenshots() {
  return (
    <section
      id="product"
      className="relative scroll-mt-20 border-y border-white/5 bg-ink-900/40 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <SectionTag>See it in motion</SectionTag>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            From the board to the dashboard.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Stories move across your Kanban board; the agent dashboard shows
            every run and event as it happens.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <BrowserFrame label="your-team.atlassian.net · Kanban board">
              <BoardMock />
            </BrowserFrame>
          </Reveal>
          <Reveal delay={120}>
            <BrowserFrame label="agent dashboard · auto-refresh 15s">
              <DashboardMock />
            </BrowserFrame>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <p className="mt-6 text-center font-mono text-xs text-slate-600">
            Representative product mockups — swap in real screenshots when you
            deploy.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function BrowserFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card h-full overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-400/70" />
        <span className="h-3 w-3 rounded-full bg-amber-400/70" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
        <span className="ml-3 truncate font-mono text-xs text-slate-500">
          {label}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ---- Jira board mockup ---- */
const COLUMNS: { name: string; cards: { id: string; title: string; tone: Parameters<typeof LabelPill>[0]["tone"]; label: string }[] }[] = [
  {
    name: "Ready",
    cards: [
      { id: "PROJ-142", title: "Rate-limit headers on public API", tone: "ready", label: "#ready" },
      { id: "PROJ-150", title: "Paginate the audit log endpoint", tone: "ready", label: "#ready" },
    ],
  },
  {
    name: "In Review",
    cards: [
      { id: "PROJ-138", title: "Webhook retry with backoff", tone: "implemented", label: "#implemented" },
    ],
  },
  {
    name: "In QA",
    cards: [
      { id: "PROJ-131", title: "CSV export for invoices", tone: "tested", label: "#tested" },
    ],
  },
  {
    name: "Done",
    cards: [
      { id: "PROJ-129", title: "SSO logout redirect fix", tone: "done", label: "#done" },
    ],
  },
];

function BoardMock() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {COLUMNS.map((col) => (
        <div key={col.name} className="rounded-xl bg-ink-800/60 p-2.5">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {col.name}
            </span>
            <span className="font-mono text-[10px] text-slate-600">
              {col.cards.length}
            </span>
          </div>
          <div className="space-y-2">
            {col.cards.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-white/5 bg-ink-900/80 p-2.5 transition-colors hover:border-accent/30"
              >
                <p className="text-[12px] font-medium leading-snug text-slate-200">
                  {c.title}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-600">
                    {c.id}
                  </span>
                  <LabelPill tone={c.tone}>{c.label}</LabelPill>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- Dashboard mockup ---- */
const RUNS = [
  { id: "#284", story: "PROJ-142", state: "running", note: "implementing · tests 8/12", tone: "implemented" as const },
  { id: "#283", story: "PROJ-138", state: "pr-open", note: "opened PR #318", tone: "qa" as const },
  { id: "#282", story: "PROJ-131", state: "qa", note: "edge cases clean", tone: "tested" as const },
  { id: "#281", story: "PROJ-129", state: "done", note: "merged · qa-passed", tone: "done" as const },
];

function DashboardMock() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-lime opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-lime" />
          </span>
          <span className="text-sm font-medium text-slate-200">
            Live runs
          </span>
          <span className="font-mono text-xs text-slate-600">tenant: sp33c</span>
        </div>
        <span className="font-mono text-[10px] text-slate-600">⟳ 15s</span>
      </div>

      <div className="space-y-2">
        {RUNS.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-ink-900/80 px-3 py-2.5"
          >
            <span className="font-mono text-xs text-slate-500">{r.id}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] text-slate-300">
                <span className="font-mono text-accent-cyan">{r.story}</span>{" "}
                <span className="text-slate-500">· {r.note}</span>
              </p>
            </div>
            <LabelPill tone={r.tone}>{r.state}</LabelPill>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["12", "runs today"],
          ["3", "PRs opened"],
          ["0", "failures"],
        ].map(([n, l]) => (
          <div
            key={l}
            className="rounded-lg bg-ink-800/60 px-3 py-2 text-center"
          >
            <div className="font-mono text-lg font-semibold text-white">
              {n}
            </div>
            <div className="text-[10px] text-slate-500">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
