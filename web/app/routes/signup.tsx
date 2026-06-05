import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { signUp } from "~/lib/auth.server";
import { AuthShell, btn, field, errorBox } from "~/lib/auth-ui";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return json({ error: "Email and password are required." });

  const res = await signUp(email, password);
  if (!res.ok) return json({ error: res.error });
  return redirect(`/confirm?email=${encodeURIComponent(email)}`);
}

export default function Signup() {
  const data = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";
  return (
    <AuthShell title="Create account" subtitle="Sign up — we'll email you a confirmation code.">
      <Form method="post" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input name="email" type="email" placeholder="you@example.com" required style={field} />
        <input name="password" type="password" placeholder="Password" required style={field} />
        <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
          Min 8 chars, with upper- & lowercase, a number and a symbol.
        </p>
        {data?.error && <div style={errorBox}>{data.error}</div>}
        <button type="submit" disabled={busy} style={btn}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </Form>
      <p style={{ color: "#64748b", fontSize: 13, marginTop: 16 }}>
        Already have an account? <a href="/login" style={{ color: "#818cf8" }}>Log in</a>
      </p>
    </AuthShell>
  );
}
