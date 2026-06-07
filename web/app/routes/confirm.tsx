import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { confirmSignUp, resendCode } from "~/lib/auth.server";
import { AuthShell, Note } from "~/lib/auth-ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const email = new URL(request.url).searchParams.get("email") ?? "";
  return json({ email });
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "confirm");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!email) return json({ error: "Email is required.", resent: false });

  if (intent === "resend") {
    const res = await resendCode(email);
    return res.ok
      ? json({ error: null, resent: true })
      : json({ error: res.error, resent: false });
  }

  const code = String(form.get("code") ?? "").trim();
  if (!code) return json({ error: "Enter the confirmation code.", resent: false });
  const res = await confirmSignUp(email, code);
  if (!res.ok) return json({ error: res.error, resent: false });
  return redirect(`/login?confirmed=1&email=${encodeURIComponent(email)}`);
}

export default function Confirm() {
  const { email } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";
  return (
    <AuthShell title="Confirm your email" subtitle="Enter the code we emailed you.">
      <Form method="post" className="flex flex-col gap-3">
        <input name="email" type="email" defaultValue={email} placeholder="you@example.com" required className="field" />
        <input name="code" inputMode="numeric" placeholder="Confirmation code" required className="field text-center font-mono tracking-[0.3em]" />
        {data?.error && <Note tone="error">{data.error}</Note>}
        {data?.resent && <Note tone="ok">A new code has been sent.</Note>}
        <button type="submit" name="intent" value="confirm" disabled={busy} className="btn-primary mt-1 w-full">
          {busy ? "Confirming…" : "Confirm"}
        </button>
        <button
          type="submit"
          name="intent"
          value="resend"
          disabled={busy}
          className="text-sm text-slate-400 transition-colors hover:text-white disabled:opacity-60"
        >
          Resend code
        </button>
      </Form>
    </AuthShell>
  );
}
