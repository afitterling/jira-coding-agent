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
                            └──┬────────┬──┘        stories          └────▲─────┘
              run+event log    │        │ dispatch (#ready)               │ PR + logs
                               ▼        ▼                                 │
                       ┌──────────┐  ┌──────────────────┐                 │
              reads    │ DynamoDB │  │ Fargate Runner   │ clone→code→test→PR
   ┌──────────────┐◀───│  "Runs"  │  │ (Claude Code CLI)│─────────────────┘
   │ Remix dash   │    └──────────┘  └──────────────────┘
   │  (web/)      │      tenant-prefixed keys · one task per story (isolated microVM)
   └──────────────┘
```

- `src/` — agent core: per-tenant Jira client, Claude prompts, DynamoDB run log, cron handler.
- `runner/` — isolated Fargate task: Claude Code CLI clones the repo, implements, tests, opens a PR.
- `web/` — Remix dashboard visualizing runs per tenant (auto-refresh 15s).
- `sst.config.ts` — Cron, DynamoDB, VPC/Cluster/Task runner, and Remix site, linked together.

### Execute modes
- `EXECUTE_MODE=inline` (default) — generate the implementation in-process, post as a Jira comment.
- `EXECUTE_MODE=fargate` — dispatch an isolated runner per story (real code + PR). Needs `TARGET_REPO` + `GITHUB_TOKEN`.

### Multi-tenant
One deployment can serve many Jira sites with isolated data/credentials/compute.
Set `TENANTS` (JSON) + `TENANT_IDS`. See [`docs/tenant-isolation.md`](docs/tenant-isolation.md).

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
