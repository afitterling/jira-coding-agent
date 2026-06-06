import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { confirmPasswordReset, requestPasswordReset } from "~/lib/auth.server";
import { AuthShell, btn, errorBox, field, okBox } from "~/lib/auth-ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const email = new URL(request.url).searchParams.get("email") ?? "";
  return json({ email });
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "request");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!email) return json({ error: "Email is required.", requested: false, reset: false, email });

  if (intent === "request") {
    const res = await requestPasswordReset(email);
    return res.ok
      ? json({ error: null, requested: true, reset: false, email })
      : json({ error: res.error, requested: false, reset: false, email });
  }

  const code = String(form.get("code") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!code || !password) {
    return json({ error: "Confirmation code and new password are required.", requested: false, reset: false, email });
  }
  const res = await confirmPasswordReset(email, code, password);
  if (!res.ok) return json({ error: res.error, requested: true, reset: false, email });
  return redirect(`/login?email=${encodeURIComponent(email)}`);
}

export default function ResetPassword() {
  const { email } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";
  const resolvedEmail = data?.email ?? email;

  return (
    <AuthShell title="Reset password" subtitle="Request a code, then set a new password.">
      <div style={{ display: "grid", gap: 16 }}>
        <Form method="post" style={{ display: "grid", gap: 12 }}>
          <input name="email" type="email" defaultValue={resolvedEmail} placeholder="you@example.com" required style={field} />
          <button type="submit" name="intent" value="request" disabled={busy} style={btn}>
            {busy ? "Sending…" : "Send reset code"}
          </button>
        </Form>

        <Form method="post" style={{ display: "grid", gap: 12 }}>
          <input name="email" type="hidden" value={resolvedEmail} />
          <input name="code" placeholder="Reset code" required style={field} />
          <input name="password" type="password" placeholder="New password" required style={field} />
          {data?.requested && <div style={okBox}>Reset code sent — check your email.</div>}
          {data?.error && <div style={errorBox}>{data.error}</div>}
          <button type="submit" name="intent" value="confirm" disabled={busy} style={btn}>
            {busy ? "Updating…" : "Set new password"}
          </button>
        </Form>
      </div>
      <p style={{ color: "#64748b", fontSize: 13, marginTop: 16 }}>
        Back to <a href="/login" style={{ color: "#818cf8" }}>log in</a>
      </p>
    </AuthShell>
  );
}
