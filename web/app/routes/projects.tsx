import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { getUser } from "~/lib/auth.server";
import { createProject, deleteProject, listProjects, type Project } from "~/lib/projects.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/login");
  const projects = await listProjects(user.email);
  return json({ email: user.email, projects });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/login");
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "delete") {
    await deleteProject(user.email, String(form.get("projectId")));
    return redirect("/projects");
  }

  const name = String(form.get("name") ?? "").trim();
  const jiraHost = String(form.get("jiraHost") ?? "").trim();
  const jiraEmail = String(form.get("jiraEmail") ?? "").trim();
  const jiraToken = String(form.get("jiraToken") ?? "").trim();
  if (!name || !jiraHost || !jiraEmail || !jiraToken) {
    return json({ error: "Name, Jira host, Jira email and token are required." });
  }
  try {
    await createProject(user.email, {
      name,
      jiraHost,
      jiraEmail,
      jiraToken,
      jql: String(form.get("jql") ?? "").trim() || undefined,
      repoUrl: String(form.get("repoUrl") ?? "").trim() || undefined,
      githubToken: String(form.get("githubToken") ?? "").trim() || undefined,
    });
  } catch (e) {
    return json({ error: (e as Error).message });
  }
  return redirect("/projects");
}

export default function Projects() {
  const { email, projects } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  return (
    <main style={{ maxWidth: 840, margin: "0 auto", padding: "32px 24px" }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>📁 Projects</h1>
        <a href="/" style={muted}>← runs</a>
        <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 13 }}>{email}</span>
        <a href="/logout" style={{ color: "#818cf8", fontSize: 13, textDecoration: "none" }}>log out</a>
      </header>

      <section style={{ marginTop: 24 }}>
        <h2 style={sectionTitle}>Your projects</h2>
        {projects.length === 0 && <Empty>No projects yet — add one below.</Empty>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {projects.map((p: Project) => (
            <div key={p.projectId} style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <strong style={{ color: "#e2e8f0" }}>{p.name}</strong>
                <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                  {p.jiraHost} · {p.jiraEmail}
                  {p.repoUrl ? ` · ${p.repoUrl}` : ""}
                </div>
              </div>
              <Form method="post" style={{ marginLeft: "auto" }}>
                <input type="hidden" name="projectId" value={p.projectId} />
                <button name="intent" value="delete" style={delBtn}>delete</button>
              </Form>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={sectionTitle}>Add a project</h2>
        <Form method="post" style={{ ...card, display: "grid", gap: 10 }}>
          <Field name="name" label="Project name" placeholder="FinWise" />
          <Field name="jiraHost" label="Jira host" placeholder="sp33c.atlassian.net" />
          <Field name="jiraEmail" label="Jira email" placeholder="bot@sp33c.tech" />
          <Field name="jiraToken" label="Jira API token" placeholder="ATATT…" secret />
          <Field name="repoUrl" label="GitHub repo URL (optional)" placeholder="https://github.com/org/repo" />
          <Field name="githubToken" label="GitHub token (optional)" placeholder="ghp_…" secret />
          <Field name="jql" label="JQL (optional)" placeholder="project = FIN ORDER BY updated DESC" />
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
            Tokens are stored in AWS Secrets Manager — never in the database or logs.
          </p>
          {data?.error && (
            <div style={{ border: "1px solid #f8717133", background: "#f8717111", color: "#f87171", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
              {data.error}
            </div>
          )}
          <button name="intent" value="create" disabled={busy} style={addBtn}>
            {busy ? "Saving…" : "Add project"}
          </button>
        </Form>
      </section>
    </main>
  );
}

function Field({ name, label, placeholder, secret }: { name: string; label: string; placeholder?: string; secret?: boolean }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ color: "#94a3b8", fontSize: 12 }}>{label}</span>
      <input
        name={name}
        type={secret ? "password" : "text"}
        placeholder={placeholder}
        autoComplete="off"
        style={{ background: "#0b1220", color: "#e2e8f0", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 10px", fontSize: 14 }}
      />
    </label>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "#64748b", marginBottom: 12 };
const card: React.CSSProperties = { background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: 16 };
const muted: React.CSSProperties = { color: "#818cf8", fontSize: 13, textDecoration: "none" };
const addBtn: React.CSSProperties = { background: "#6366f1", color: "white", border: "none", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const delBtn: React.CSSProperties = { background: "transparent", color: "#f87171", border: "1px solid #f8717133", borderRadius: 8, padding: "6px 10px", fontSize: 13, cursor: "pointer" };

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 16, color: "#64748b", fontSize: 14 }}>{children}</div>;
}
