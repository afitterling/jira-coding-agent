/** Shared shell for the auth pages (signup / confirm / login). */
import { Logo, Note } from "~/lib/ui";

export { Note };

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-6 flex justify-center">
          <Logo tagline="agentic coding · Jira" />
        </div>

        <div className="card p-7">
          <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <p className="mt-5 text-center text-sm text-slate-400">{footer}</p>
        )}
      </div>
    </main>
  );
}
