import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import { getUser } from "~/lib/auth.server";
import {
  createProject,
  deleteProject,
  getProjectJiraToken,
  listJiraProjects,
  listProjects,
  updateProject,
  verifyJira,
  type JiraProjectOption,
  type Project,
} from "~/lib/projects.server";
import { AppHeader, Empty, Eyebrow, NavLink, Note } from "~/lib/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/login");
  const projects = await listProjects(user.email);

  // When editing, list the connected Jira's projects for the picker (best-effort).
  const editId = new URL(request.url).searchParams.get("edit");
  let jiraProjects: JiraProjectOption[] = [];
  let jiraError: string | null = null;
  if (editId && projects.some((p) => p.projectId === editId)) {
    try {
      jiraProjects = await listJiraProjects(user.email, editId);
    } catch (e) {
      jiraError = (e as Error).message;
    }
  }
  return json({ email: user.email, projects, jiraProjects, jiraError });
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
  const jiraProject = String(form.get("jiraProject") ?? "").trim() || undefined;
  const jql = String(form.get("jql") ?? "").trim() || undefined;
  const repoUrl = String(form.get("repoUrl") ?? "").trim() || undefined;
  const githubToken = String(form.get("githubToken") ?? "").trim() || undefined;

  if (intent === "test") {
    const projectId = String(form.get("projectId") ?? "");
    // Use the entered token, or fall back to the stored one when editing.
    let token = jiraToken;
    if (!token && projectId) token = await getProjectJiraToken(user.email, projectId).catch(() => "");
    if (!jiraHost || !jiraEmail || !token) {
      return json({ testError: "Enter Jira host, email and token first." });
    }
    try {
      const { displayName } = await verifyJira(jiraHost, jiraEmail, token);
      return json({ testOk: `Connected to Jira as ${displayName}.` });
    } catch (e) {
      return json({ testError: (e as Error).message });
    }
  }

  if (intent === "update") {
    const projectId = String(form.get("projectId") ?? "");
    // On edit, tokens are optional — blank keeps the stored credential.
    if (!projectId || !name || !jiraHost || !jiraEmail) {
      return json({ error: "Name, Jira host and Jira email are required." });
    }
    try {
      await updateProject(user.email, projectId, {
        name,
        jiraHost,
        jiraEmail,
        jiraProject,
        jql,
        repoUrl,
        jiraToken: jiraToken || undefined,
        githubToken,
      });
    } catch (e) {
      return json({ error: (e as Error).message });
    }
    return redirect("/projects");
  }

  // create
  if (!name || !jiraHost || !jiraEmail || !jiraToken) {
    return json({ error: "Name, Jira host, Jira email and token are required." });
  }
  try {
    await createProject(user.email, { name, jiraHost, jiraEmail, jiraToken, jiraProject, jql, repoUrl, githubToken });
  } catch (e) {
    return json({ error: (e as Error).message });
  }
  return redirect("/projects");
}

export default function Projects() {
  const { email, projects, jiraProjects, jiraError } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  const [params] = useSearchParams();
  const editId = params.get("edit");
  const editing = editId ? projects.find((p: Project) => p.projectId === editId) ?? null : null;

  // The action returns one of several shapes — read each field defensively.
  const formError = data && "error" in data ? data.error : undefined;
  const testOk = data && "testOk" in data ? data.testOk : undefined;
  const testError = data && "testError" in data ? data.testError : undefined;

  return (
    <>
      <AppHeader
        right={
          <>
            <NavLink href="/">Runs</NavLink>
            <NavLink href="/costs">Costs</NavLink>
            <NavLink href="/configure">Configure</NavLink>
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
            {projects.map((p: Project) => {
              const active = p.projectId === editId;
              return (
                <div
                  key={p.projectId}
                  className={`card flex items-center gap-4 p-4 ${active ? "!border-accent/60 ring-1 ring-accent/30" : "card-hover"}`}
                >
                  {/* Click the project to edit it. */}
                  <Link
                    to={`?edit=${p.projectId}#project-form`}
                    className="flex min-w-0 flex-1 items-center gap-4"
                    title="Edit project"
                  >
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
                  </Link>
                  <Link
                    to={`?edit=${p.projectId}#project-form`}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-white/30 hover:bg-white/5"
                  >
                    Edit
                  </Link>
                  <Form method="post">
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
              );
            })}
          </div>
        </section>

        <section className="mt-10 scroll-mt-24" id="project-form">
          <div className="flex items-center justify-between">
            <Eyebrow>{editing ? `Edit · ${editing.name}` : "Add a project"}</Eyebrow>
            {editing && (
              <Link to="/projects" className="text-xs font-medium text-slate-400 hover:text-white">
                Cancel
              </Link>
            )}
          </div>

          {/* key resets the pre-filled inputs when switching between projects / add. */}
          <Form key={editId ?? "new"} method="post" className="card grid gap-6 p-6">
            {editing && <input type="hidden" name="projectId" value={editing.projectId} />}

            <Group title="Basics">
              <Field name="name" label="Project name" placeholder="FinWise" defaultValue={editing?.name} required />
            </Group>

            <Group title="Jira connection">
              <Field name="jiraHost" label="Jira host" placeholder="sp33c.atlassian.net" defaultValue={editing?.jiraHost} required />
              <Field name="jiraEmail" label="Jira email" placeholder="bot@sp33c.tech" defaultValue={editing?.jiraEmail} required />
              <Field
                name="jiraToken"
                label="Jira API token"
                placeholder={editing ? "•••••••••••• unchanged" : "ATATT…"}
                secret
                required={!editing}
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  name="intent"
                  value="test"
                  formNoValidate
                  disabled={busy}
                  className="btn-ghost !px-3.5 !py-2"
                >
                  {busy ? "Testing…" : "Test connection"}
                </button>
                {testOk && <span className="text-xs text-emerald-300">{testOk}</span>}
                {testError && <span className="text-xs text-red-300">{testError}</span>}
              </div>
            </Group>

            <Group title="Scope">
              <JiraProjectField
                editing={Boolean(editing)}
                options={jiraProjects}
                selected={editing?.jiraProject}
                error={jiraError}
              />
              <Field name="jql" label="JQL override (optional)" placeholder="project = FIN ORDER BY updated DESC" defaultValue={editing?.jql} />
            </Group>

            <Group title="Repository">
              <Field name="repoUrl" label="GitHub repo URL (optional)" placeholder="https://github.com/org/repo" defaultValue={editing?.repoUrl} />
              <Field
                name="githubToken"
                label="GitHub token (optional)"
                placeholder={editing ? "•••••••••••• unchanged" : "ghp_…"}
                secret
              />
            </Group>

            <p className="text-xs text-slate-500">
              {editing
                ? "Tokens stay hidden — leave them blank to keep the current credentials, or enter a new value to rotate. Stored in AWS Secrets Manager."
                : "Tokens are stored in AWS Secrets Manager — never in the database or logs."}
            </p>
            {formError && <Note tone="error">{formError}</Note>}
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <button
                name="intent"
                value={editing ? "update" : "create"}
                disabled={busy}
                className="btn-primary"
              >
                {busy ? "Saving…" : editing ? "Save changes" : "Add project"}
              </button>
              <Link to="/configure" className="btn-ghost">
                Configure architecture &amp; agents →
              </Link>
            </div>
          </Form>
        </section>
      </main>
    </>
  );
}

/** A labelled group of fields within the configuration form. */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-white/5 pt-5 first:border-t-0 first:pt-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</span>
      {children}
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  secret,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  secret?: boolean;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="field-label">{label}</span>
      <input
        name={name}
        type={secret ? "password" : "text"}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        autoComplete="off"
        className="field"
      />
    </label>
  );
}

/** Jira project picker — populated from the connected Jira when editing a saved project. */
function JiraProjectField({
  editing,
  options,
  selected,
  error,
}: {
  editing: boolean;
  options: JiraProjectOption[];
  selected?: string;
  error: string | null;
}) {
  // Before the project exists there are no stored credentials to query Jira with.
  if (!editing) {
    return (
      <label className="grid gap-1.5">
        <span className="field-label">Jira project</span>
        <input className="field opacity-60" disabled placeholder="Save the project first, then pick a Jira project here" />
      </label>
    );
  }

  // Keep the stored value selectable even if the live list failed to load.
  const opts = [...options];
  if (selected && !opts.some((o) => o.key === selected)) {
    opts.unshift({ key: selected, name: "current selection" });
  }

  return (
    <label className="grid gap-1.5">
      <span className="field-label">Jira project</span>
      <select name="jiraProject" defaultValue={selected ?? ""} className="field">
        <option value="" className="bg-ink-900">— all matching issues (no project filter) —</option>
        {opts.map((o) => (
          <option key={o.key} value={o.key} className="bg-ink-900">
            {o.key} · {o.name}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs text-red-300">Couldn&apos;t load Jira projects: {error}</span>
      ) : (
        <span className="text-xs text-slate-500">
          Scopes the agent to one Jira project. Refresh after changing credentials.
        </span>
      )}
    </label>
  );
}
