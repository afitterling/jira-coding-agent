# Marketing site — _Code as spec. Driven by Jira._

A self-contained [Remix](https://remix.run/) (Vite) + TypeScript + Tailwind CSS
landing page by **sp33c** that pitches the Jira coding agent: how a Jira story
becomes shipped code via an autonomous, **agentic AI** coding agent (Claude
Opus).

It's a single, smooth-scroll marketing page:

1. **Hero** — the pitch, primary CTA, animated "story → PR" visual, and a
   scroll indicator hinting at more below.
2. **How it works** — the six-step, label-driven flow (story → `#ready` →
   agent → implement/test/QA → PR → human review).
3. **Diagrams** — the real flow diagrams from the repo's `docs/`
   (`system-flow`, `testing-flow`, `qa-flow`), embedded with captions.
4. **Features** — agentic AI (highlighted), Jira workflow integration, testing
   + QA sub-flows, and tenant isolation.
5. **Product** — mocked-up Jira board and live run dashboard.
6. **About** — sp33c / Alex Fitterling and the agentic AI focus.
7. **Footer** — repo/doc links, contact, and the GPLv3 note.

## Quick start

```bash
cd website
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR                |
| `npm run build`     | Production build (`build/client`, `build/server`) |
| `npm run start`     | Serve the production build (`remix-serve`)        |
| `npm run typecheck` | Type-check with `tsc --noEmit`                    |

```bash
npm run build && npm run start   # preview the production build
```

## Deploy (Vercel)

This app uses the Remix Vite preset and deploys to Vercel out of the box:

```bash
cd website
vercel          # preview deploy
vercel --prod   # production deploy
```

## Stack & notes

- **Remix + Vite + TypeScript**, mirroring the dashboard app in `../web`.
- **Tailwind CSS** (dark-first, high-contrast) via PostCSS. Design tokens and
  custom keyframes live in `tailwind.config.ts`; global styles in
  `app/tailwind.css`.
- **Motion** is tasteful and CSS-driven — scroll reveals use a tiny
  `IntersectionObserver` (`app/components/Reveal.tsx`) and everything honours
  `prefers-reduced-motion`.
- **Responsive** mobile → desktop, with a collapsing nav.
- **Performance** — no heavy client libraries; SVGs are lazy-loaded; fonts are
  preconnected. Server-rendered for good Lighthouse scores.

### Diagrams

The three SVGs in `public/diagrams/` are copies of the canonical diagrams in
the repo `docs/` folder. If you regenerate the `.mmd` sources, re-copy them:

```bash
cp ../docs/{system-flow,testing-flow,qa-flow}.svg public/diagrams/
```

### Replacing the mockups

The board and dashboard in the **Product** section are CSS mockups. Drop real
screenshots into `public/` and swap the `<*Mock />` components in
`app/components/Screenshots.tsx` for `<img>` tags.

## License

Licensed under the [GNU General Public License v3.0](../LICENSE), same as the
parent project. Copyright (C) 2026 sp33c — Alex Frank Fitterling.
