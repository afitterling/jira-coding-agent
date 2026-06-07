import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { commitSession, getUser, login } from "~/lib/auth.server";
import { AuthShell, Note } from "~/lib/auth-ui";

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
    <AuthShell
      title="Log in"
      subtitle="Welcome back."
      footer={
        <>
          No account?{" "}
          <a href="/signup" className="font-medium text-accent hover:text-accent-violet">
            Sign up
          </a>
        </>
      }
    >
      <Form method="post" className="flex flex-col gap-3">
        <input name="email" type="email" defaultValue={email} placeholder="you@example.com" required className="field" />
        <input name="password" type="password" placeholder="Password" required className="field" />
        {confirmed && <Note tone="ok">Email confirmed — you can log in now.</Note>}
        {data?.error && <Note tone="error">{data.error}</Note>}
        <button type="submit" disabled={busy} className="btn-primary mt-1 w-full">
          {busy ? "Logging in…" : "Log in"}
        </button>
      </Form>
    </AuthShell>
  );
}
