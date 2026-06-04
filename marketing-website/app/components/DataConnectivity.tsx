import { Reveal } from "~/components/Reveal";

/** How data flows through Synapse, plugged in to delivered. */
const PIPELINE = ["Connect", "Ingest", "Normalise", "Store & Index", "Reason", "Deliver"];

const CONNECTORS: { title: string; body: string; chips: string[] }[] = [
  {
    title: "All kinds of databases",
    body: "SQL, NoSQL, and warehouses — read context and write results back to your system of record.",
    chips: ["Postgres", "AWS DynamoDB", "MySQL", "MongoDB", "Snowflake", "BigQuery"],
  },
  {
    title: "APIs & webhooks",
    body: "Pull live data and push outcomes across the tools you already run.",
    chips: ["REST", "GraphQL", "Jira", "Slack"],
  },
  {
    title: "Object storage & files",
    body: "Ingest documents, datasets, and artifacts at any scale.",
    chips: ["AWS S3", "Nextcloud", "Azure Blob", "CSV", "Parquet"],
  },
  {
    title: "Streaming & feeds",
    body: "React in near-real-time to events, queues, and market data.",
    chips: ["Kafka", "Queues", "Market data", "Alt-data"],
  },
];

const OUTPUTS: { title: string; body: string }[] = [
  { title: "Pull requests", body: "Reviewed code changes opened on GitHub." },
  { title: "Jira write-back", body: "Comments, labels, and workflow transitions on the source story." },
  { title: "Live dashboard", body: "Every run + event streamed to the Remix dashboard." },
  { title: "Webhooks & Slack", body: "Push events and notifications to your channels." },
  { title: "Database write-back", body: "Results persisted to Postgres, Snowflake, or BigQuery." },
  { title: "File exports", body: "CSV / Parquet / JSON written to S3 or Blob." },
  { title: "REST / GraphQL API", body: "Query runs, artifacts, and analyses programmatically." },
];

export function DataConnectivity() {
  return (
    <section
      id="data"
      className="relative scroll-mt-20 border-b border-white/5 py-24 sm:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-[340px] w-[640px] rounded-full bg-accent/[0.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-indigo-200">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Data Connectivity
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Synapse — <span className="text-gradient">wired into your data.</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400">
              Agents are only as good as what they can reach. <span className="font-medium text-indigo-200">Synapse</span>{" "}
              is the connective layer: plug in a source, it gets ingested,
              normalised, stored, and reasoned over — then delivered through any
              of the output interfaces below.
            </p>
          </Reveal>
        </div>

        {/* How data is plugged in & ingested */}
        <Reveal delay={120}>
          <div className="mt-12 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex min-w-max items-center gap-2 font-mono text-xs">
              {PIPELINE.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-slate-200">
                    <span className="mr-1.5 text-accent">{i + 1}</span>
                    {step}
                  </span>
                  {i < PIPELINE.length - 1 && <span className="text-accent/60">→</span>}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Inputs */}
        <Reveal delay={80}>
          <h3 className="mt-12 font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
            Plugged in — input connectors
          </h3>
        </Reveal>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONNECTORS.map((c, i) => (
            <Reveal key={c.title} delay={i * 70}>
              <div className="card group h-full p-6 transition-colors hover:border-white/20">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-glow" />
                  <h4 className="text-sm font-semibold text-white">{c.title}</h4>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.body}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-300 ring-1 ring-inset ring-white/10"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Outputs */}
        <Reveal delay={80}>
          <div className="mt-12 flex items-center gap-3">
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
              Delivered — output interfaces
            </h3>
            <span className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-cyan-200">
              {OUTPUTS.length} interfaces
            </span>
          </div>
        </Reveal>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OUTPUTS.map((o, i) => (
            <Reveal key={o.title} delay={i * 50}>
              <div className="card group flex h-full items-start gap-3 p-5 transition-colors hover:border-white/20">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent-cyan/10 font-mono text-xs font-bold text-cyan-300 ring-1 ring-inset ring-accent-cyan/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{o.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{o.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
