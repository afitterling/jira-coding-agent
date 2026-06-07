import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { signUp } from "~/lib/auth.server";
import { AuthShell, Note } from "~/lib/auth-ui";

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
    <AuthShell
      title="Create account"
      subtitle="Sign up — we'll email you a confirmation code."
      footer={
        <>
          Already have an account?{" "}
          <a href="/login" className="font-medium text-accent hover:text-accent-violet">
            Log in
          </a>
        </>
      }
    >
      <Form method="post" className="flex flex-col gap-3">
        <input name="email" type="email" placeholder="you@example.com" required className="field" />
        <input name="password" type="password" placeholder="Password" required className="field" />
        <p className="text-xs text-slate-500">
          Min 8 chars, with upper- &amp; lowercase, a number and a symbol.
        </p>
        {data?.error && <Note tone="error">{data.error}</Note>}
        <button type="submit" disabled={busy} className="btn-primary mt-1 w-full">
          {busy ? "Creating…" : "Create account"}
        </button>
      </Form>
    </AuthShell>
  );
}
