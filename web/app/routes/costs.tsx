import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { getUser, isAdmin } from "~/lib/auth.server";
import {
  getCostReport,
  getProjectCosts,
  type CostReport,
  type ProjectCost,
} from "~/lib/costs.server";
import { AppHeader, Empty, Eyebrow, NavLink, Note } from "~/lib/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/login");
  const admin = isAdmin(user);
  try {
    const report = await getCostReport(6);
    const projectReport = await getProjectCosts(report);
    if (admin) {
      return json({ admin: true, email: user.email, report, projects: projectReport.projects, error: null as string | null });
    }
    // Owner: only their own projects, no app-wide totals.
    const mine = projectReport.projects.filter((p) => p.ownerEmail === user.email);
    return json({ admin: false, email: user.email, report: null as CostReport | null, projects: mine, error: null as string | null });
  } catch (e) {
    return json({ admin, email: user.email, report: null as CostReport | null, projects: [] as ProjectCost[], error: (e as Error).message });
  }
}

function money(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export default function Costs() {
  const { admin, email, report, projects, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const currency = report?.currency ?? "USD";

  useEffect(() => {
    const id = setInterval(() => revalidator.revalidate(), 5 * 60_000);
    return () => clearInterval(id);
  }, [revalidator]);

  const maxMonth = report ? Math.max(1, ...report.months.map((m) => m.amount)) : 1;

  return (
    <>
      <AppHeader
        right={
          <>
            <NavLink href="/">Runs</NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <span className="hidden text-sm text-slate-500 sm:inline">{email}</span>
            <a href="/logout" className="btn-ghost !px-3.5 !py-2">Log out</a>
          </>
        }
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="text-gradient">Cost</span>
          </h1>
          <span className="pb-1.5 font-mono text-xs text-slate-500">
            {admin ? "admin · all stages & projects" : "your projects"}
          </span>
        </div>

        {error && <div className="mt-6"><Note tone="error">Cost Explorer error: {error}</Note></div>}

        {/* ---- Admin: app-wide cost (all stages × service) -------------------- */}
        {admin && report && !report.tagsActive && (
          <div className="mt-6">
            <Note tone="warn">
              The <code className="font-mono">sst:app</code>/<code className="font-mono">sst:stage</code> cost-allocation
              tags don&apos;t appear active yet. Activate them in <strong>Billing → Cost allocation tags</strong> (data lags up to 24h).
            </Note>
          </div>
        )}

        {admin && report && (
          <>
            <section className="card mt-6 flex flex-wrap items-baseline gap-4 p-6">
              <span className="font-mono text-xs text-slate-500">
                {report.periodStart} → {report.periodEnd}
              </span>
              <span className="ml-auto eyebrow">app total</span>
              <strong className="text-3xl font-extrabold text-white">{money(report.grandTotal, currency)}</strong>
            </section>

            <section className="mt-10">
              <Eyebrow>Monthly trend</Eyebrow>
              <div className="card flex h-44 items-end gap-3 p-6">
                {report.months.map((m) => (
                  <div key={m.month} className="group flex-1 text-center">
                    <div
                      title={money(m.amount, currency)}
                      className="mx-auto w-full rounded-t-md bg-gradient-to-t from-accent to-accent-violet transition-opacity group-hover:opacity-80"
                      style={{ height: `${Math.round((m.amount / maxMonth) * 90)}px`, minHeight: 2 }}
                    />
                    <div className="mt-2 font-mono text-[11px] text-slate-400">{m.month.slice(5)}</div>
                    <div className="font-mono text-[11px] text-slate-600">{money(m.amount, currency)}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <Eyebrow>By stage &amp; AWS position</Eyebrow>
              {report.stages.length === 0 && <Empty>No cost recorded for this app in the period.</Empty>}
              <div className="flex flex-col gap-4">
                {report.stages.map((s) => (
                  <div key={s.stage} className="card p-5">
                    <div className="mb-3 flex items-baseline">
                      <strong className="text-base text-white">{s.stage}</strong>
                      <strong className="ml-auto text-base text-white">{money(s.total, currency)}</strong>
                    </div>
                    {s.services.map((svc) => (
                      <div key={svc.service} className="grid grid-cols-[1fr_110px] gap-3 border-t border-white/5 py-1.5 font-mono text-xs">
                        <span className="text-slate-300">{svc.service}</span>
                        <span className="text-right text-slate-400">{money(svc.amount, currency)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ---- Per-project cost (admin: all; owner: only theirs) -------------- */}
        <section className="mt-10">
          <Eyebrow>{admin ? "By project (estimated)" : "Your projects (estimated)"}</Eyebrow>
          {projects.length === 0 && (
            <Empty>{admin ? "No projects yet." : "You have no projects, or no cost attributed yet."}</Empty>
          )}
          {projects.length > 0 && (
            <div className="card p-5">
              <div className="grid grid-cols-[1fr_110px_110px_110px] gap-3 pb-1.5 font-mono text-xs font-semibold text-slate-500">
                <span>project</span>
                <span className="text-right">runner</span>
                <span className="text-right">shared</span>
                <span className="text-right">total</span>
              </div>
              {projects.map((p) => (
                <div key={p.projectId} className="grid grid-cols-[1fr_110px_110px_110px] gap-3 border-t border-white/5 py-2 font-mono text-xs">
                  <span className="text-white">
                    {p.name}
                    {admin && <span className="text-slate-500"> · {p.ownerEmail}</span>}
                    <span className="text-slate-600"> · {p.runnerRuns} runs</span>
                  </span>
                  <span className="text-right text-slate-400">{money(p.runnerCost, currency)}</span>
                  <span className="text-right text-slate-400">{money(p.sharedCost, currency)}</span>
                  <span className="text-right font-semibold text-white">{money(p.total, currency)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-slate-600">
            Estimate: Fargate/ECS cost split by runner-dispatch count; shared infra split equally per
            project. Source: AWS Cost Explorer (UnblendedCost).
          </p>
        </section>
      </main>
    </>
  );
}
