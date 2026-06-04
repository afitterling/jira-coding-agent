import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { recentRuns, runEvents, type RunEvent, type RunSummary } from "~/lib/runs.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const runs = await recentRuns(25);
  const selected = new URL(request.url).searchParams.get("run") ?? runs[0]?.runId;
  const events = selected ? await runEvents(selected) : [];
  return json({ runs, selected, events });
}

const LEVEL_COLOR: Record<string, string> = {
  info: "#38bdf8",
  success: "#34d399",
  warn: "#fbbf24",
  error: "#f87171",
};
const STATUS_COLOR: Record<string, string> = {
  running: "#fbbf24",
  ok: "#34d399",
  error: "#f87171",
};

function fmt(ts?: string) {
  return ts ? new Date(ts).toLocaleString() : "—";
}

export default function Dashboard() {
  const { runs, selected, events } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [, setParams] = useSearchParams();

  // Auto-refresh so the dashboard "notifies" as the cron runs.
  useEffect(() => {
    const id = setInterval(() => revalidator.revalidate(), 15_000);
    return () => clearInterval(id);
  }, [revalidator]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>🤖 Jira Coding Agent</h1>
        <span style={{ color: "#64748b", fontSize: 13 }}>
          cron every 2 min · auto-refresh 15s
        </span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, marginTop: 24 }}>
        {/* Runs list */}
        <section>
          <h2 style={sectionTitle}>Runs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {runs.length === 0 && <Empty>No runs yet — waiting for the first cron tick.</Empty>}
            {runs.map((r: RunSummary) => (
              <button
                key={r.runId}
                onClick={() => setParams({ run: r.runId })}
                style={{
                  ...card,
                  textAlign: "left",
                  cursor: "pointer",
                  borderColor: r.runId === selected ? "#6366f1" : "#1e293b",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Dot color={STATUS_COLOR[r.status]} label={r.status} />
                  <span style={{ color: "#64748b", fontSize: 12 }}>{fmt(r.startedAt)}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: "#94a3b8" }}>
                  fetched {r.fetched} · revised {r.revised} · impl {r.implemented} ·
                  tested {r.tested ?? 0} · qa {r.qaPassed ?? 0}
                  {r.errors ? ` · ⚠ ${r.errors}` : ""}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Event log */}
        <section>
          <h2 style={sectionTitle}>Event log {selected ? `· ${selected}` : ""}</h2>
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            {events.length === 0 && <Empty>No events for this run.</Empty>}
            {events.map((e: RunEvent, i: number) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "150px 80px 90px 1fr",
                  gap: 10,
                  padding: "8px 14px",
                  borderTop: i === 0 ? "none" : "1px solid #1e293b",
                  fontSize: 13,
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                <span style={{ color: "#64748b" }}>
                  {new Date(e.ts).toLocaleTimeString()}
                </span>
                <span style={{ color: LEVEL_COLOR[e.level], fontWeight: 600 }}>{e.level}</span>
                <span style={{ color: "#818cf8" }}>{e.stage}</span>
                <span>
                  {e.issueKey && <strong style={{ color: "#e2e8f0" }}>{e.issueKey} </strong>}
                  <span style={{ color: "#cbd5e1" }}>{e.message}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#64748b",
  marginBottom: 12,
};
const card: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1e293b",
  borderRadius: 10,
  padding: 12,
};

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: color }} />
      {label}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 16, color: "#64748b", fontSize: 14 }}>{children}</div>;
}
