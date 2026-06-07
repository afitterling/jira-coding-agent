import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { recentRuns, runEvents, tenants, type RunEvent, type RunSummary } from "~/lib/runs.server";
import { getUser } from "~/lib/auth.server";
import { AppHeader, Empty, Eyebrow, NavLink, StatusDot } from "~/lib/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const tenantList = tenants();
  const tenant = url.searchParams.get("tenant") ?? tenantList[0] ?? "default";
  const runs = await recentRuns(tenant, 25);
  const selected = url.searchParams.get("run") ?? runs[0]?.runId;
  const events = selected ? await runEvents(tenant, selected) : [];
  const user = await getUser(request);
  return json({ tenants: tenantList, tenant, runs, selected, events, user });
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
  const { tenants: tenantList, tenant, runs, selected, events, user } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [, setParams] = useSearchParams();

  // Auto-refresh so the dashboard "notifies" as the cron runs.
  useEffect(() => {
    const id = setInterval(() => revalidator.revalidate(), 15_000);
    return () => clearInterval(id);
  }, [revalidator]);

  return (
    <>
      <AppHeader
        right={
          <>
            <NavLink href="/costs">Costs</NavLink>
            {user ? (
              <>
                <NavLink href="/projects">Projects</NavLink>
                <NavLink href="/configure">Configure</NavLink>
                <a href="/profile" className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:inline">{user.email}</a>
                <a href="/logout" className="btn-ghost !px-3.5 !py-2">Log out</a>
              </>
            ) : (
              <a href="/login" className="btn-primary !px-4 !py-2">Log in</a>
            )}
          </>
        }
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Title */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-slate-300">
              <StatusDot color="#a3e635" pulse />
              live · cron every 2 min · auto-refresh 15s
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Agent <span className="text-gradient">runs</span>
            </h1>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <span className="eyebrow">tenant</span>
            <select
              value={tenant}
              onChange={(e) => setParams({ tenant: e.target.value })}
              className="field !w-auto !py-2 font-mono"
            >
              {tenantList.map((t: string) => (
                <option key={t} value={t} className="bg-ink-900">{t}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Runs list */}
          <section>
            <Eyebrow>Runs</Eyebrow>
            <div className="flex flex-col gap-2.5">
              {runs.length === 0 && <Empty>No runs yet — waiting for the first cron tick.</Empty>}
              {runs.map((r: RunSummary) => {
                const active = r.runId === selected;
                return (
                  <button
                    key={r.runId}
                    onClick={() => setParams({ tenant, run: r.runId })}
                    className={`card card-hover p-3.5 text-left ${active ? "!border-accent/60 ring-1 ring-accent/30" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <StatusDot color={STATUS_COLOR[r.status]} label={r.status} pulse={r.status === "running"} />
                      <span className="font-mono text-xs text-slate-500">{fmt(r.startedAt)}</span>
                    </div>
                    <div className="mt-2 font-mono text-xs text-slate-400">
                      fetched {r.fetched} · revised {r.revised} · impl {r.implemented} · tested {r.tested ?? 0} · qa {r.qaPassed ?? 0}
                      {r.errors ? <span className="text-red-400"> · ⚠ {r.errors}</span> : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Event log */}
          <section>
            <Eyebrow>Event log {selected ? <span className="font-mono normal-case tracking-normal text-slate-600">· {selected}</span> : ""}</Eyebrow>
            <div className="card overflow-hidden">
              {events.length === 0 && <Empty>No events for this run.</Empty>}
              {events.map((e: RunEvent, i: number) => (
                <div
                  key={i}
                  className={`grid grid-cols-[120px_70px_80px_1fr] gap-3 px-4 py-2 font-mono text-xs ${i === 0 ? "" : "border-t border-white/5"}`}
                >
                  <span className="text-slate-500">{new Date(e.ts).toLocaleTimeString()}</span>
                  <span className="font-semibold" style={{ color: LEVEL_COLOR[e.level] }}>{e.level}</span>
                  <span className="text-accent">{e.stage}</span>
                  <span>
                    {e.issueKey && <strong className="text-white">{e.issueKey} </strong>}
                    <span className="text-slate-300">{e.message}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
