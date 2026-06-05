import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { commitSession, getUser, login } from "~/lib/auth.server";
import { AuthShell, btn, field, errorBox, okBox } from "~/lib/auth-ui";

export async function loader({ request }: LoaderFunctionArgs) {
  // Already logged in → straight to the dashboard.
  if (await getUser(request)) return redirect("/");
  const url = new URL(request.url);
  return json({
    confirmed: url.searchParams.get("confirmed") === "1",
    email: url.searchParams.get("email") ?? "",
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return json({ error: "Email and password are required." });

  const res = await login(email, password);
  if (!res.ok) {
    if (res.needsConfirmation) return redirect(`/confirm?email=${encodeURIComponent(email)}`);
    return json({ error: res.error });
  }
  return redirect("/", { headers: { "Set-Cookie": await commitSession(res.user) } });
}

export default function Login() {
  const { confirmed, email } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";
  return (
    <AuthShell title="Log in" subtitle="Welcome back.">
      <Form method="post" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input name="email" type="email" defaultValue={email} placeholder="you@example.com" required style={field} />
        <input name="password" type="password" placeholder="Password" required style={field} />
        {confirmed && <div style={okBox}>Email confirmed — you can log in now.</div>}
        {data?.error && <div style={errorBox}>{data.error}</div>}
        <button type="submit" disabled={busy} style={btn}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </Form>
      <p style={{ color: "#64748b", fontSize: 13, marginTop: 16 }}>
        No account? <a href="/signup" style={{ color: "#818cf8" }}>Sign up</a>
      </p>
    </AuthShell>
  );
}
