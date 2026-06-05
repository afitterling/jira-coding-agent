import { SectionTag } from "~/components/HowItWorks";
import { LabelPill } from "~/components/LabelPill";
import { Reveal } from "~/components/Reveal";
import { useT } from "~/i18n/context";

export function Screenshots() {
  const { t } = useT();
  const sc = t.screenshots;
  return (
    <section
      id="product"
      className="relative scroll-mt-20 border-y border-white/5 bg-ink-900/40 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <SectionTag>{sc.tag}</SectionTag>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {sc.heading}
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {sc.intro}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <BrowserFrame label={sc.boardLabel}>
              <BoardMock />
            </BrowserFrame>
          </Reveal>
          <Reveal delay={120}>
            <BrowserFrame label={sc.dashboardLabel}>
              <DashboardMock />
            </BrowserFrame>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <p className="mt-6 text-center font-mono text-xs text-slate-600">
            {sc.footnote}
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
/** Card metadata (ids, tones, labels stay literal); titles come from the dictionary by flat index. */
const COLUMN_META: { cards: { id: string; tone: Parameters<typeof LabelPill>[0]["tone"]; label: string }[] }[] = [
  {
    cards: [
      { id: "PROJ-142", tone: "ready", label: "#ready" },
      { id: "PROJ-150", tone: "ready", label: "#ready" },
    ],
  },
  { cards: [{ id: "PROJ-138", tone: "implemented", label: "#implemented" }] },
  { cards: [{ id: "PROJ-131", tone: "tested", label: "#tested" }] },
  { cards: [{ id: "PROJ-129", tone: "done", label: "#done" }] },
];

function BoardMock() {
  const { t } = useT();
  const sc = t.screenshots;
  let cardIndex = 0;
  const columns = COLUMN_META.map((col, i) => ({
    name: sc.columns[i],
    cards: col.cards.map((c) => ({ ...c, title: sc.cards[cardIndex++] })),
  }));
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {columns.map((col) => (
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
/** Run metadata (ids, stories, state codes, tones stay literal); notes come from the dictionary. */
const RUN_META = [
  { id: "#284", story: "PROJ-142", state: "running", tone: "implemented" as const },
  { id: "#283", story: "PROJ-138", state: "pr-open", tone: "qa" as const },
  { id: "#282", story: "PROJ-131", state: "qa", tone: "tested" as const },
  { id: "#281", story: "PROJ-129", state: "done", tone: "done" as const },
];

function DashboardMock() {
  const { t } = useT();
  const d = t.screenshots.dashboard;
  const runs = RUN_META.map((r, i) => ({ ...r, note: d.notes[i] }));
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-lime opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-lime" />
          </span>
          <span className="text-sm font-medium text-slate-200">
            {d.liveRuns}
          </span>
          <span className="font-mono text-xs text-slate-600">{d.tenant}</span>
        </div>
        <span className="font-mono text-[10px] text-slate-600">⟳ 15s</span>
      </div>

      <div className="space-y-2">
        {runs.map((r) => (
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
        {d.stats.map(([n, l]) => (
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
