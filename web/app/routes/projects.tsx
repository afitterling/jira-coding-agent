import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { getUser } from "~/lib/auth.server";
import { createProject, deleteProject, listProjects, type Project } from "~/lib/projects.server";
import { AppHeader, Empty, Eyebrow, NavLink, Note } from "~/lib/ui";

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
    <>
      <AppHeader
        right={
          <>
            <NavLink href="/">Runs</NavLink>
            <NavLink href="/costs">Costs</NavLink>
            <span className="hidden text-sm text-slate-500 sm:inline">{email}</span>
            <a href="/logout" className="btn-ghost !px-3.5 !py-2">Log out</a>
          </>
        }
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Your <span className="text-gradient">projects</span>
        </h1>

        <section className="mt-8">
          <Eyebrow>Connected projects</Eyebrow>
          {projects.length === 0 && <Empty>No projects yet — add one below.</Empty>}
          <div className="flex flex-col gap-2.5">
            {projects.map((p: Project) => (
              <div key={p.projectId} className="card card-hover flex items-center gap-4 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/5 font-mono text-sm font-semibold text-accent">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <strong className="text-white">{p.name}</strong>
                  <div className="truncate font-mono text-xs text-slate-400">
                    {p.jiraHost} · {p.jiraEmail}
                    {p.repoUrl ? ` · ${p.repoUrl}` : ""}
                  </div>
                </div>
                <Form method="post" className="ml-auto">
                  <input type="hidden" name="projectId" value={p.projectId} />
                  <button
                    name="intent"
                    value="delete"
                    className="rounded-lg border border-red-400/25 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </Form>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <Eyebrow>Add a project</Eyebrow>
          <Form method="post" className="card grid gap-4 p-6">
            <Field name="name" label="Project name" placeholder="FinWise" />
            <Field name="jiraHost" label="Jira host" placeholder="sp33c.atlassian.net" />
            <Field name="jiraEmail" label="Jira email" placeholder="bot@sp33c.tech" />
            <Field name="jiraToken" label="Jira API token" placeholder="ATATT…" secret />
            <Field name="repoUrl" label="GitHub repo URL (optional)" placeholder="https://github.com/org/repo" />
            <Field name="githubToken" label="GitHub token (optional)" placeholder="ghp_…" secret />
            <Field name="jql" label="JQL (optional)" placeholder="project = FIN ORDER BY updated DESC" />
            <p className="text-xs text-slate-500">
              Tokens are stored in AWS Secrets Manager — never in the database or logs.
            </p>
            {data?.error && <Note tone="error">{data.error}</Note>}
            <button name="intent" value="create" disabled={busy} className="btn-primary mt-1">
              {busy ? "Saving…" : "Add project"}
            </button>
          </Form>
        </section>
      </main>
    </>
  );
}

function Field({ name, label, placeholder, secret }: { name: string; label: string; placeholder?: string; secret?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="field-label">{label}</span>
      <input
        name={name}
        type={secret ? "password" : "text"}
        placeholder={placeholder}
        autoComplete="off"
        className="field"
      />
    </label>
  );
}
