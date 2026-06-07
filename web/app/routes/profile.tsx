import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser, isAdmin } from "~/lib/auth.server";
import { AppHeader, Eyebrow, NavLink, Note } from "~/lib/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/login");
  return json({ email: user.email, groups: user.groups, admin: isAdmin(user) });
}

export default function Profile() {
  const { email, groups, admin } = useLoaderData<typeof loader>();
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <>
      <AppHeader
        right={
          <>
            <NavLink href="/">Runs</NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavLink href="/costs">Costs</NavLink>
            <a href="/logout" className="btn-ghost !px-3.5 !py-2">Log out</a>
          </>
        }
      />

      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Your <span className="text-gradient">profile</span>
        </h1>

        {/* Account */}
        <section className="mt-8">
          <Eyebrow>Account</Eyebrow>
          <div className="card flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-violet font-mono text-sm font-bold text-white shadow-glow">
              {initials}
            </div>
            <div className="min-w-0">
              <strong className="text-white">{email}</strong>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-300">
                  {admin ? "admin" : "member"}
                </span>
                {groups.map((g) => (
                  <span key={g} className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-400">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Change password — AS-52 (preview) */}
        <section className="mt-10">
          <Eyebrow>Change password</Eyebrow>
          <div className="card grid gap-3 p-6">
            <label className="grid gap-1.5">
              <span className="field-label">Current password</span>
              <input type="password" placeholder="••••••••" disabled className="field opacity-60" />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">New password</span>
              <input type="password" placeholder="••••••••" disabled className="field opacity-60" />
            </label>
            <Note tone="warn">Coming soon — wiring to Cognito ChangePassword is tracked in AS-52.</Note>
          </div>
        </section>

        {/* Profile data — AS-53 (preview) */}
        <section className="mt-10">
          <Eyebrow>Profile data</Eyebrow>
          <div className="card grid gap-3 p-6">
            <label className="grid gap-1.5">
              <span className="field-label">Address</span>
              <input placeholder="Street, city, country" disabled className="field opacity-60" />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">Preferred language</span>
              <select disabled className="field opacity-60">
                <option>English</option>
                <option>Deutsch</option>
                <option>中文</option>
                <option>Bahasa Melayu</option>
              </select>
            </label>
            <Note tone="warn">Coming soon — address & preferred language are tracked in AS-53.</Note>
          </div>
        </section>
      </main>
    </>
  );
}
