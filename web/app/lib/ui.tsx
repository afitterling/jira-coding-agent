/** Shared UI shell + primitives — mirrors the marketing site's look & feel. */

export function Logo({ tagline }: { tagline?: string }) {
  return (
    <a href="/" className="group flex items-center gap-2.5">
      <span className="logo-mark">{"</>"}</span>
      <span className="font-mono text-sm font-semibold tracking-tight text-slate-100">
        sp<span className="text-accent">33</span>c
      </span>
      {tagline && (
        <span className="hidden font-mono text-xs text-slate-500 sm:inline">
          {tagline}
        </span>
      )}
    </a>
  );
}

/** Sticky, frosted top bar. `right` holds page-specific actions. */
export function AppHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo tagline="agentic coding · Jira" />
        <div className="flex items-center gap-1.5 sm:gap-2">{right}</div>
      </nav>
    </header>
  );
}

/** Page container under the header. */
export function Page({
  children,
  width = "max-w-7xl",
}: {
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <main className={`mx-auto w-full ${width} px-4 py-8 sm:px-6 lg:px-8 lg:py-12`}>
      {children}
    </main>
  );
}

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className="nav-link">
      {children}
    </a>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <h2 className="eyebrow mb-3">{children}</h2>;
}

export function StatusDot({
  color,
  label,
  pulse,
}: {
  color: string;
  label?: string;
  pulse?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ background: color }}
          />
        )}
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ background: color }}
        />
      </span>
      {label}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-500">
      {children}
    </div>
  );
}

export function Note({
  tone,
  children,
}: {
  tone: "warn" | "error" | "ok";
  children: React.ReactNode;
}) {
  const tones = {
    warn: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    error: "border-red-400/25 bg-red-400/10 text-red-300",
    ok: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  };
  return (
    <div className={`rounded-xl border px-4 py-2.5 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}
