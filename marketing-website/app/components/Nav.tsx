import { useEffect, useState } from "react";

import { LanguageToggle } from "~/components/LanguageToggle";
import { useT } from "~/i18n/context";

const LINK_HREFS = ["#how", "#loop", "#interfaces", "#use-cases", "#data", "#faq", "#about"];

const REPO_URL = "https://github.com/afitterling/jira-coding-agent";

// Deployed dashboard — "Getting started" drops visitors straight into project setup.
const APP_URL =
  "https://d3fd7sbat6bqj3.cloudfront.net/projects?edit=test-fd75e6ba#project-form";

export function Nav() {
  const { t } = useT();
  const links = LINK_HREFS.map((href, i) => ({ href, label: t.nav.links[i] }));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-ink-950/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-violet text-sm font-bold text-white shadow-glow">
            {"</>"}
          </span>
          <span className="font-mono text-sm font-semibold tracking-tight text-slate-100">
            sp<span className="text-accent">33</span>c
          </span>
          <span className="hidden font-mono text-xs text-slate-500 sm:inline">
            agentic coding · Jira
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/pricing"
            className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:inline-flex"
          >
            {t.nav.pricing}
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:inline-flex sm:items-center sm:gap-1.5"
          >
            <GitHubMark className="h-4 w-4" />
            {t.nav.github}
          </a>
          <LanguageToggle className="hidden sm:inline-flex" />
          <a
            href="#how"
            className="hidden text-sm text-slate-400 transition-colors hover:text-white lg:inline-flex"
          >
            {t.nav.cta}
          </a>
          <a href={APP_URL} className="btn-primary !px-4 !py-2">
            {t.nav.start}
          </a>
          <button
            type="button"
            aria-label={t.nav.menuAria}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink-950/95 px-4 py-3 backdrop-blur-xl md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 border-t border-white/10 pt-3">
            <a
              href={APP_URL}
              onClick={() => setOpen(false)}
              className="btn-primary mb-3 w-full"
            >
              {t.nav.start}
            </a>
            <a
              href="/pricing"
              onClick={() => setOpen(false)}
              className="mb-2 block rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5"
            >
              {t.nav.pricing}
            </a>
            <LanguageToggle />
          </div>
        </div>
      )}
    </header>
  );
}

export function GitHubMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
