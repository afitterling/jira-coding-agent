import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import {
  commitSession,
  confirmPasswordReset,
  confirmSignUp,
  getUser,
  login,
  requestPasswordReset,
  resendCode,
  signUp,
} from "~/lib/auth.server";

const DASHBOARD_URL = process.env.DASHBOARD_URL ?? "/";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  const url = new URL(request.url);
  return json({
    user,
    dashboardUrl: DASHBOARD_URL,
    mode: url.searchParams.get("mode") === "login" ? "login" : "signup",
    email: url.searchParams.get("email") ?? "",
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (intent === "signup") {
    if (!email || !password) return json({ mode: "signup", error: "Email and password are required." });
    const res = await signUp(email, password);
    return res.ok
      ? json({ mode: "signup", ok: "Account created. Enter your confirmation code.", email, needsConfirm: true })
      : json({ mode: "signup", error: res.error, email });
  }

  if (intent === "confirm-signup") {
    const code = String(form.get("code") ?? "").trim();
    if (!email || !code) return json({ mode: "signup", error: "Email and confirmation code are required.", email, needsConfirm: true });
    const res = await confirmSignUp(email, code);
    return res.ok
      ? json({ mode: "login", ok: "Email confirmed. You can now log in.", email })
      : json({ mode: "signup", error: res.error, email, needsConfirm: true });
  }

  if (intent === "resend-code") {
    if (!email) return json({ mode: "signup", error: "Email is required.", needsConfirm: true });
    const res = await resendCode(email);
    return res.ok
      ? json({ mode: "signup", ok: "A new confirmation code has been sent.", email, needsConfirm: true })
      : json({ mode: "signup", error: res.error, email, needsConfirm: true });
  }

  if (intent === "login") {
    if (!email || !password) return json({ mode: "login", error: "Email and password are required." });
    const res = await login(email, password);
    if (!res.ok) {
      return json({
        mode: "login",
        error: res.error,
        email,
        needsConfirm: !!res.needsConfirmation,
      });
    }
    return redirect("/getting-started", { headers: { "Set-Cookie": await commitSession(res.user) } });
  }

  if (intent === "request-reset") {
    if (!email) return json({ mode: "login", error: "Email is required." });
    const res = await requestPasswordReset(email);
    return res.ok
      ? json({ mode: "login", ok: "Reset code sent. Enter it with your new password.", email, needsReset: true })
      : json({ mode: "login", error: res.error, email, needsReset: true });
  }

  if (intent === "confirm-reset") {
    const code = String(form.get("code") ?? "").trim();
    if (!email || !password || !code) {
      return json({ mode: "login", error: "Email, code and new password are required.", email, needsReset: true });
    }
    const res = await confirmPasswordReset(email, code, password);
    return res.ok
      ? json({ mode: "login", ok: "Password updated. You can log in now.", email })
      : json({ mode: "login", error: res.error, email, needsReset: true });
  }

  if (intent === "save-onboarding") {
    const projectName = String(form.get("projectName") ?? "").trim();
    const technology = String(form.get("technology") ?? "").trim();
    const repos = String(form.get("repos") ?? "")
      .split(/\r?\n|,/)
      .map((v) => v.trim())
      .filter(Boolean);
    if (!projectName || !technology || repos.length === 0) {
      return json({ onboardingError: "Project name, technology and at least one repository are required." });
    }
    return json({ onboardingOk: "Great setup. Next: connect plugins and complete repo authorization in the dashboard." });
  }

  return json({ error: "Unknown action." }, { status: 400 });
}

export default function GettingStarted() {
  const { user, dashboardUrl, mode, email } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  if (user) {
    return (
      <main className="min-h-screen bg-[radial-gradient(120%_120%_at_50%_0%,rgba(99,102,241,0.22),rgba(0,0,0,1))] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <a href="/" className="text-sm text-violet-300 hover:text-violet-200">← Back to marketing page</a>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Welcome, <span className="text-gradient">{user.email}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Let&apos;s start your build pipeline: define the project and technology now, then add plugins and connect GitHub repos.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StepCard idx="01" title="Project" body="Name what you are building and its goal." />
            <StepCard idx="02" title="Technology" body="Choose your stack and architecture direction." />
            <StepCard idx="03" title="Plugins + GitHub" body="Next, connect plugins and authorize repositories." />
          </div>

          <Form method="post" className="card mt-8 grid gap-4 p-6">
            <input type="hidden" name="intent" value="save-onboarding" />
            <Field name="projectName" label="What project do you want to build?" placeholder="AI support copilot for fintech onboarding" />
            <Field name="technology" label="What kind of technology?" placeholder="Remix + AWS Lambda + DynamoDB" />
            <Field name="plugins" label="Planned plugins (optional)" placeholder="Jira, Slack, PagerDuty, Datadog" />
            <TextAreaField name="repos" label="GitHub repositories (one per line)" placeholder={"https://github.com/org/repo-a\nhttps://github.com/org/repo-b"} />
            {data?.onboardingError && <Message tone="error">{data.onboardingError}</Message>}
            {data?.onboardingOk && <Message tone="ok">{data.onboardingOk}</Message>}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={busy} className="btn-primary">
                {busy ? "Saving…" : "Save onboarding step"}
              </button>
              <a href={dashboardUrl} className="btn-ghost">
                Continue to dashboard
              </a>
            </div>
          </Form>
        </div>
      </main>
    );
  }

  const currentMode = (data?.mode as "login" | "signup" | undefined) ?? mode;
  const resolvedEmail = data?.email ?? email;
  const needsConfirm = !!data?.needsConfirm;
  const needsReset = !!data?.needsReset;

  return (
    <main className="min-h-screen bg-[radial-gradient(120%_120%_at_50%_0%,rgba(99,102,241,0.28),rgba(0,0,0,1))] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-3 shadow-[0_0_120px_-40px_rgba(99,102,241,0.6)] backdrop-blur-xl sm:p-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <a href="/" className="text-sm text-violet-300 hover:text-violet-200">← Back</a>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Getting started</p>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Trendy onboarding.<br />
              <span className="text-gradient">Cognito-backed auth.</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Sign up or log in, then define your project and technology. Next we guide plugin setup and GitHub linking.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Dot /> Sign up + email verification</li>
              <li className="flex items-center gap-2"><Dot /> Login + secure session</li>
              <li className="flex items-center gap-2"><Dot /> Project + technology capture</li>
              <li className="flex items-center gap-2"><Dot /> Plugin + repo linking next</li>
            </ul>
          </section>

          <section className="card p-6">
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/30 p-1">
              <a href="/getting-started?mode=signup" className={`rounded-lg px-4 py-2 text-center text-sm font-medium ${currentMode === "signup" ? "bg-violet-500 text-white" : "text-slate-300 hover:bg-white/5"}`}>Sign up</a>
              <a href="/getting-started?mode=login" className={`rounded-lg px-4 py-2 text-center text-sm font-medium ${currentMode === "login" ? "bg-violet-500 text-white" : "text-slate-300 hover:bg-white/5"}`}>Log in</a>
            </div>

            {data?.error && <Message tone="error">{data.error}</Message>}
            {data?.ok && <Message tone="ok">{data.ok}</Message>}

            {currentMode === "signup" ? (
              <div className="grid gap-4">
                <Form method="post" className="grid gap-3">
                  <input type="hidden" name="intent" value="signup" />
                  <Field name="email" label="Email" type="email" defaultValue={resolvedEmail} placeholder="you@example.com" />
                  <Field name="password" label="Password" type="password" placeholder="Strong password" />
                  <button type="submit" disabled={busy} className="btn-primary w-full">
                    {busy ? "Creating…" : "Create account"}
                  </button>
                </Form>

                {(needsConfirm || currentMode === "signup") && (
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Email confirmation</p>
                    <Form method="post" className="grid gap-3">
                      <input type="hidden" name="intent" value="confirm-signup" />
                      <Field name="email" label="Email" type="email" defaultValue={resolvedEmail} placeholder="you@example.com" />
                      <Field name="code" label="Confirmation code" placeholder="123456" />
                      <button type="submit" disabled={busy} className="btn-ghost w-full">
                        Confirm account
                      </button>
                    </Form>
                    <Form method="post">
                      <input type="hidden" name="intent" value="resend-code" />
                      <input type="hidden" name="email" value={resolvedEmail} />
                      <button type="submit" disabled={busy} className="text-sm text-violet-300 hover:text-violet-200">
                        Resend confirmation code
                      </button>
                    </Form>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                <Form method="post" className="grid gap-3">
                  <input type="hidden" name="intent" value="login" />
                  <Field name="email" label="Email" type="email" defaultValue={resolvedEmail} placeholder="you@example.com" />
                  <Field name="password" label="Password" type="password" placeholder="Password" />
                  <button type="submit" disabled={busy} className="btn-primary w-full">
                    {busy ? "Logging in…" : "Log in"}
                  </button>
                </Form>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Password reset</p>
                  <Form method="post" className="mt-3 grid gap-3">
                    <input type="hidden" name="intent" value="request-reset" />
                    <Field name="email" label="Email" type="email" defaultValue={resolvedEmail} placeholder="you@example.com" />
                    <button type="submit" disabled={busy} className="btn-ghost w-full">
                      Send reset code
                    </button>
                  </Form>
                  {(needsReset || currentMode === "login") && (
                    <Form method="post" className="mt-3 grid gap-3">
                      <input type="hidden" name="intent" value="confirm-reset" />
                      <Field name="email" label="Email" type="email" defaultValue={resolvedEmail} placeholder="you@example.com" />
                      <Field name="code" label="Reset code" placeholder="123456" />
                      <Field name="password" label="New password" type="password" placeholder="New strong password" />
                      <button type="submit" disabled={busy} className="btn-ghost w-full">
                        Update password
                      </button>
                    </Form>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />;
}

function Field({
  name,
  label,
  placeholder,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-slate-400">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
      />
    </label>
  );
}

function TextAreaField({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-slate-400">{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        className="rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
      />
    </label>
  );
}

function StepCard({ idx, title, body }: { idx: string; title: string; body: string }) {
  return (
    <div className="card p-4">
      <p className="font-mono text-xs text-violet-300">{idx}</p>
      <h2 className="mt-2 text-base font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-300">{body}</p>
    </div>
  );
}

function Message({ tone, children }: { tone: "ok" | "error"; children: React.ReactNode }) {
  return (
    <div
      className={`mb-3 rounded-xl border px-3 py-2 text-sm ${
        tone === "ok"
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-rose-400/30 bg-rose-400/10 text-rose-300"
      }`}
    >
      {children}
    </div>
  );
}
