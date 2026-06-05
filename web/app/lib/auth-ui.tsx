/** Shared styling + shell for the auth pages (signup / confirm / login). */

export const field: React.CSSProperties = {
  background: "#0b1220",
  color: "#e2e8f0",
  border: "1px solid #1e293b",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
};

export const btn: React.CSSProperties = {
  background: "#6366f1",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

export const errorBox: React.CSSProperties = {
  border: "1px solid #f8717133",
  background: "#f8717111",
  color: "#f87171",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
};

export const okBox: React.CSSProperties = {
  border: "1px solid #34d39933",
  background: "#34d39911",
  color: "#34d399",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
};

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main style={{ maxWidth: 380, margin: "0 auto", padding: "64px 24px" }}>
      <a href="/" style={{ color: "#818cf8", fontSize: 13, textDecoration: "none" }}>
        ← Jira Coding Agent
      </a>
      <h1 style={{ fontSize: 22, marginTop: 24, marginBottom: 4 }}>{title}</h1>
      {subtitle && <p style={{ color: "#64748b", fontSize: 14, marginTop: 0 }}>{subtitle}</p>}
      <div style={{ marginTop: 20 }}>{children}</div>
    </main>
  );
}
