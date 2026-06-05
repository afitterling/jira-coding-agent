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
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>💸 Cost</h1>
        <span style={{ color: "#64748b", fontSize: 13 }}>
          {admin ? "admin · all stages & projects" : "your projects"}
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "#64748b", fontSize: 13 }}>{email}</span>
          <a href="/" style={link}>← runs</a>
          <a href="/logout" style={link}>log out</a>
        </span>
      </header>

      {error && <Note tone="error">Cost Explorer error: {error}</Note>}

      {/* ---- Admin: app-wide cost (all stages × service) -------------------- */}
      {admin && report && !report.tagsActive && (
        <Note tone="warn">
          The <code>sst:app</code>/<code>sst:stage</code> cost-allocation tags don&apos;t appear active
          yet. Activate them in <strong>Billing → Cost allocation tags</strong> (data lags up to 24h).
        </Note>
      )}

      {admin && report && (
        <>
          <section style={{ ...card, marginTop: 20, display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              {report.periodStart} → {report.periodEnd}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>app total</span>
            <strong style={{ fontSize: 26 }}>{money(report.grandTotal, currency)}</strong>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={sectionTitle}>Monthly trend</h2>
            <div style={{ ...card, display: "flex", gap: 12, alignItems: "flex-end", height: 140 }}>
              {report.months.map((m) => (
                <div key={m.month} style={{ flex: 1, textAlign: "center" }}>
                  <div
                    title={money(m.amount, currency)}
                    style={{
                      height: `${Math.round((m.amount / maxMonth) * 90)}px`,
                      background: "#6366f1",
                      borderRadius: "4px 4px 0 0",
                      margin: "0 auto",
                      minHeight: 2,
                    }}
                  />
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{m.month.slice(5)}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{money(m.amount, currency)}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={sectionTitle}>By stage &amp; AWS position</h2>
            {report.stages.length === 0 && <Empty>No cost recorded for this app in the period.</Empty>}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {report.stages.map((s) => (
                <div key={s.stage} style={card}>
                  <div style={{ display: "flex", alignItems: "baseline", marginBottom: 8 }}>
                    <strong style={{ fontSize: 16, color: "#e2e8f0" }}>{s.stage}</strong>
                    <strong style={{ marginLeft: "auto", fontSize: 16 }}>{money(s.total, currency)}</strong>
                  </div>
                  {s.services.map((svc) => (
                    <div key={svc.service} style={posRow}>
                      <span style={{ color: "#cbd5e1" }}>{svc.service}</span>
                      <span style={{ textAlign: "right", color: "#94a3b8" }}>{money(svc.amount, currency)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ---- Per-project cost (admin: all; owner: only theirs) -------------- */}
      <section style={{ marginTop: 24 }}>
        <h2 style={sectionTitle}>
          {admin ? "By project (estimated)" : "Your projects (estimated)"}
        </h2>
        {projects.length === 0 && (
          <Empty>{admin ? "No projects yet." : "You have no projects, or no cost attributed yet."}</Empty>
        )}
        {projects.length > 0 && (
          <div style={card}>
            <div style={{ ...posRow, borderTop: "none", color: "#64748b", fontWeight: 600 }}>
              <span>project</span>
              <span style={{ textAlign: "right" }}>runner</span>
              <span style={{ textAlign: "right" }}>shared</span>
              <span style={{ textAlign: "right" }}>total</span>
            </div>
            {projects.map((p) => (
              <div key={p.projectId} style={projRow}>
                <span style={{ color: "#e2e8f0" }}>
                  {p.name}
                  {admin && <span style={{ color: "#64748b" }}> · {p.ownerEmail}</span>}
                  <span style={{ color: "#475569", fontSize: 12 }}> · {p.runnerRuns} runs</span>
                </span>
                <span style={{ textAlign: "right", color: "#94a3b8" }}>{money(p.runnerCost, currency)}</span>
                <span style={{ textAlign: "right", color: "#94a3b8" }}>{money(p.sharedCost, currency)}</span>
                <span style={{ textAlign: "right", color: "#e2e8f0", fontWeight: 600 }}>{money(p.total, currency)}</span>
              </div>
            ))}
          </div>
        )}
        <p style={{ color: "#475569", fontSize: 12, marginTop: 12 }}>
          Estimate: Fargate/ECS cost split by runner-dispatch count; shared infra split equally per
          project. Source: AWS Cost Explorer (UnblendedCost).
        </p>
      </section>
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
  padding: 16,
};
const link: React.CSSProperties = { color: "#818cf8", fontSize: 13, textDecoration: "none" };
const posRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 110px",
  gap: 10,
  padding: "5px 0",
  borderTop: "1px solid #1e293b",
  fontSize: 13,
  fontFamily: "ui-monospace, monospace",
};
const projRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 110px 110px 110px",
  gap: 10,
  padding: "6px 0",
  borderTop: "1px solid #1e293b",
  fontSize: 13,
  fontFamily: "ui-monospace, monospace",
};

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 16, color: "#64748b", fontSize: 14 }}>{children}</div>;
}

function Note({ tone, children }: { tone: "warn" | "error"; children: React.ReactNode }) {
  const c = tone === "error" ? "#f87171" : "#fbbf24";
  return (
    <div style={{ marginTop: 16, padding: "10px 14px", border: `1px solid ${c}33`, background: `${c}11`, borderRadius: 8, color: c, fontSize: 13 }}>
      {children}
    </div>
  );
}
