import { GitHubMark } from "~/components/Nav";
import { Reveal } from "~/components/Reveal";

const REPO_URL = "https://github.com/afitterling/jira-coding-agent";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink-950">
      {/* Final CTA */}
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[700px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
        />
        <Reveal className="relative text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your backlog is already the spec.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Point the agentic AI at a board, label a story{" "}
            <span className="font-mono text-accent-lime">#ready</span>, and
            review the PR it opens.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-primary">
              <GitHubMark className="h-4 w-4" />
              Get the source
            </a>
            <a href="#how" className="btn-ghost">
              Revisit the flow
            </a>
          </div>
        </Reveal>
      </div>

      {/* Link row */}
      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-violet text-sm font-bold text-white">
                {"</>"}
              </span>
              <span className="font-mono text-sm font-semibold text-slate-100">
                sp<span className="text-accent">33</span>c
              </span>
              <span className="font-mono text-xs text-slate-500">
                agentic coding · Jira
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              sp33c builds agentic coding with Jira — an autonomous Claude Opus
              agent that turns stories into reviewed pull requests, with Human
              Override keeping you in command.
            </p>
          </div>

          <nav className="text-sm">
            <h3 className="font-semibold text-slate-200">Project</h3>
            <ul className="mt-3 space-y-2 text-slate-500">
              <li>
                <a className="transition-colors hover:text-white" href={REPO_URL} target="_blank" rel="noreferrer">
                  GitHub repository
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href={`${REPO_URL}#readme`} target="_blank" rel="noreferrer">
                  Documentation
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="/diagrams/system-flow.svg" target="_blank" rel="noreferrer">
                  System flow diagram
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="https://sp33c.tech" target="_blank" rel="noreferrer">
                  sp33c.tech
                </a>
              </li>
            </ul>
          </nav>

          <address className="text-sm not-italic">
            <h3 className="font-semibold text-slate-200">Contact</h3>
            <div className="mt-3 space-y-1.5 text-slate-500">
              <p className="text-slate-400">sp33c · Alex Fitterling</p>
              <p>Wöhrder Kreuzgasse 8</p>
              <p>90489 Nürnberg, Germany</p>
              <p>
                <a
                  className="text-accent-cyan transition-colors hover:text-cyan-200"
                  href="mailto:info@sp33c.tech"
                >
                  info@sp33c.tech
                </a>
              </p>
            </div>
          </address>
        </div>
      </div>

      {/* License bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-600 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © 2026 sp33c — Alex Frank Fitterling. Licensed under the{" "}
            <a
              className="text-slate-400 underline decoration-dotted underline-offset-2 transition-colors hover:text-white"
              href="https://www.gnu.org/licenses/gpl-3.0.html"
              target="_blank"
              rel="noreferrer"
            >
              GNU General Public License v3.0
            </a>
            .
          </p>
          <p className="font-mono">Agentic coding with Jira · sp33c · Nuremberg</p>
        </div>
      </div>
    </footer>
  );
}
