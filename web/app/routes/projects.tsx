import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
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
  const stack = String(form.get("stack") ?? "aws").trim().toLowerCase();
  const jiraHost = String(form.get("jiraHost") ?? "").trim();
  const jiraEmail = String(form.get("jiraEmail") ?? "").trim();
  const jiraToken = String(form.get("jiraToken") ?? "").trim();
  const repoUrls = String(form.get("repoUrls") ?? "")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!name || !jiraHost || !jiraEmail || !jiraToken || repoUrls.length === 0) {
    return json({ error: "Name, stack, Jira host, Jira email, Jira token and at least one repo URL are required." });
  }
  if (stack !== "aws" && stack !== "azure") {
    return json({ error: "Stack must be AWS or Azure." });
  }

  const awsAccessKeyId = String(form.get("awsAccessKeyId") ?? "").trim();
  const awsSecretAccessKey = String(form.get("awsSecretAccessKey") ?? "").trim();
  const azureTenantId = String(form.get("azureTenantId") ?? "").trim();
  const azureClientId = String(form.get("azureClientId") ?? "").trim();
  const azureClientSecret = String(form.get("azureClientSecret") ?? "").trim();
  const azureSubscriptionId = String(form.get("azureSubscriptionId") ?? "").trim();
  if (stack === "aws" && (!awsAccessKeyId || !awsSecretAccessKey)) {
    return json({ error: "AWS stack requires access key ID and secret access key." });
  }
  if (stack === "azure" && (!azureTenantId || !azureClientId || !azureClientSecret || !azureSubscriptionId)) {
    return json({ error: "Azure stack requires tenant ID, client ID, client secret and subscription ID." });
  }
  try {
    await createProject(user.email, {
      name,
      stack,
      jiraHost,
      jiraEmail,
      jiraToken,
      jql: String(form.get("jql") ?? "").trim() || undefined,
      repoUrls,
      githubToken: String(form.get("githubToken") ?? "").trim() || undefined,
      awsAccessKeyId: awsAccessKeyId || undefined,
      awsSecretAccessKey: awsSecretAccessKey || undefined,
      azureTenantId: azureTenantId || undefined,
      azureClientId: azureClientId || undefined,
      azureClientSecret: azureClientSecret || undefined,
      azureSubscriptionId: azureSubscriptionId || undefined,
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
  const [stack, setStack] = useState<"aws" | "azure">("aws");

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
                  {p.stack.toUpperCase()} · {p.jiraHost} · {p.jiraEmail}
                  {p.repoUrls.length > 0 ? ` · ${p.repoUrls.length} repos linked` : ""}
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
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ color: "#94a3b8", fontSize: 12 }}>Cloud stack</span>
            <select
              name="stack"
              value={stack}
              onChange={(e) => setStack(e.currentTarget.value === "azure" ? "azure" : "aws")}
              style={{ background: "#0b1220", color: "#e2e8f0", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 10px", fontSize: 14 }}
            >
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
            </select>
          </label>
          <Field name="jiraHost" label="Jira host" placeholder="sp33c.atlassian.net" />
          <Field name="jiraEmail" label="Jira email" placeholder="bot@sp33c.tech" />
          <Field name="jiraToken" label="Jira API token" placeholder="ATATT…" secret />
          {stack === "aws" ? (
            <>
              <Field name="awsAccessKeyId" label="AWS access key ID" placeholder="AKIA…" />
              <Field name="awsSecretAccessKey" label="AWS secret access key" placeholder="••••••••" secret />
            </>
          ) : (
            <>
              <Field name="azureTenantId" label="Azure tenant ID" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
              <Field name="azureClientId" label="Azure client ID" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
              <Field name="azureClientSecret" label="Azure client secret" placeholder="••••••••" secret />
              <Field name="azureSubscriptionId" label="Azure subscription ID" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            </>
          )}
          <TextAreaField
            name="repoUrls"
            label="Repo URLs (one per line)"
            placeholder={"https://github.com/org/repo-a\nhttps://github.com/org/repo-b"}
          />
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

function TextAreaField({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ color: "#94a3b8", fontSize: 12 }}>{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        style={{ background: "#0b1220", color: "#e2e8f0", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 10px", fontSize: 14, resize: "vertical" }}
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
