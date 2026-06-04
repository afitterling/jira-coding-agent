# jira-coding-agent

An agent that "docks" a Jira Kanban board and, on a cron, revises then implements
stories via label-driven prompts — with a Remix dashboard to watch it work.

Pipeline: `#revise` + `#undone` → revise via Claude → `#revised`; `#ready` →
generate implementation → `#implemented`. (Jira labels can't contain `#`; they map
to plain tokens like `revise`, `ready` — configurable.)

See [`docs/system-flow.svg`](docs/system-flow.svg) and [`docs/features.md`](docs/features.md).

## Architecture (SST / Ion on AWS)

```
┌────────────┐   rate(2m)   ┌──────────────┐   pull/label/comment   ┌──────────┐
│ Cron       │ ───────────▶ │ Agent Lambda │ ─────────────────────▶ │  Jira    │
└────────────┘              │  src/agent   │ ◀───────────────────── │  Cloud   │
                            └──────┬───────┘        stories          └──────────┘
                                   │ run + event log
                                   ▼
                            ┌──────────────┐        reads          ┌──────────────┐
                            │ DynamoDB     │ ◀──────────────────── │ Remix dash   │
                            │  "Runs"      │                       │  (web/)      │
                            └──────────────┘                       └──────────────┘
```

- `src/` — agent core: Jira client, Claude prompts, DynamoDB run log, cron handler.
- `web/` — Remix dashboard visualizing runs and their event logs (auto-refresh 15s).
- `sst.config.ts` — Cron, DynamoDB table, and Remix site, linked together.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in JIRA_* and ANTHROPIC_API_KEY
```

`.env.local` (loaded by SST) holds the secrets — at minimum `JIRA_HOST`,
`JIRA_EMAIL`, `JIRA_TOKEN`, and `ANTHROPIC_API_KEY`.

## Run

```bash
npx sst dev       # live local dev (Lambda live + Remix), needs AWS credentials
npx sst deploy    # deploy to AWS; outputs the dashboard URL
```

> **No login yet** — the dashboard is currently public. Add auth before exposing it.

## License

Licensed under the [GNU General Public License v3.0](LICENSE).

Copyright (C) 2026 Alex Frank Fitterling
