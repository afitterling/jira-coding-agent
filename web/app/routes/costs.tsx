import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { getCostReport, type CostReport } from "~/lib/costs.server";

export async function loader(_: LoaderFunctionArgs) {
  try {
    const report = await getCostReport(6);
    return json({ report, error: null as string | null });
  } catch (e) {
    return json({ report: null as CostReport | null, error: (e as Error).message });
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
  const { report, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  // Cost data lags; a slow refresh keeps the page live without hammering CE.
  useEffect(() => {
    const id = setInterval(() => revalidator.revalidate(), 5 * 60_000);
    return () => clearInterval(id);
  }, [revalidator]);

  const maxMonth = report ? Math.max(1, ...report.months.map((m) => m.amount)) : 1;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>💸 Cost — {report?.app ?? "jira-coding-agent"}</h1>
        <span style={{ color: "#64748b", fontSize: 13 }}>all stages · per AWS service</span>
        <a href="/" style={link}>← runs</a>
      </header>

      {error && <Note tone="error">Cost Explorer error: {error}</Note>}

      {report && !report.tagsActive && (
        <Note tone="warn">
          The <code>sst:app</code>/<code>sst:stage</code> cost-allocation tags don&apos;t appear active
          yet. Activate them in <strong>Billing → Cost allocation tags</strong> (data lags up to 24h);
          until then costs may show under <code>(untagged)</code>.
        </Note>
      )}

      {report && (
        <>
          <section style={{ ...card, marginTop: 20, display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              {report.periodStart} → {report.periodEnd}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>grand total</span>
            <strong style={{ fontSize: 26 }}>{money(report.grandTotal, report.currency)}</strong>
          </section>

          {/* Monthly trend */}
          <section style={{ marginTop: 24 }}>
            <h2 style={sectionTitle}>Monthly trend</h2>
            <div style={{ ...card, display: "flex", gap: 12, alignItems: "flex-end", height: 140 }}>
              {report.months.map((m) => (
                <div key={m.month} style={{ flex: 1, textAlign: "center" }}>
                  <div
                    title={money(m.amount, report.currency)}
                    style={{
                      height: `${Math.round((m.amount / maxMonth) * 90)}px`,
                      background: "#6366f1",
                      borderRadius: "4px 4px 0 0",
                      margin: "0 auto",
                      minHeight: 2,
                    }}
                  />
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{m.month.slice(5)}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    {money(m.amount, report.currency)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Per-stage breakdown by AWS service (position) */}
          <section style={{ marginTop: 24 }}>
            <h2 style={sectionTitle}>By stage &amp; AWS position</h2>
            {report.stages.length === 0 && <Empty>No cost recorded for this app in the period.</Empty>}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {report.stages.map((s) => (
                <div key={s.stage} style={card}>
                  <div style={{ display: "flex", alignItems: "baseline", marginBottom: 8 }}>
                    <strong style={{ fontSize: 16, color: "#e2e8f0" }}>{s.stage}</strong>
                    <strong style={{ marginLeft: "auto", fontSize: 16 }}>
                      {money(s.total, report.currency)}
                    </strong>
                  </div>
                  {s.services.map((svc) => (
                    <div
                      key={svc.service}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 110px",
                        gap: 10,
                        padding: "5px 0",
                        borderTop: "1px solid #1e293b",
                        fontSize: 13,
                        fontFamily: "ui-monospace, monospace",
                      }}
                    >
                      <span style={{ color: "#cbd5e1" }}>{svc.service}</span>
                      <span style={{ textAlign: "right", color: "#94a3b8" }}>
                        {money(svc.amount, report.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <p style={{ color: "#475569", fontSize: 12, marginTop: 24 }}>
            UnblendedCost · source: AWS Cost Explorer · generated{" "}
            {new Date(report.generatedAt).toLocaleString()}
          </p>
        </>
      )}
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
const link: React.CSSProperties = { marginLeft: "auto", color: "#818cf8", fontSize: 13, textDecoration: "none" };

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 16, color: "#64748b", fontSize: 14 }}>{children}</div>;
}

function Note({ tone, children }: { tone: "warn" | "error"; children: React.ReactNode }) {
  const c = tone === "error" ? "#f87171" : "#fbbf24";
  return (
    <div
      style={{
        marginTop: 16,
        padding: "10px 14px",
        border: `1px solid ${c}33`,
        background: `${c}11`,
        borderRadius: 8,
        color: c,
        fontSize: 13,
      }}
    >
      {children}
    </div>
  );
}
