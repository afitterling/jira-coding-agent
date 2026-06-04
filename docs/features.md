# Features

The Jira coding agent processes stories from a Kanban board through a label-driven
pipeline. See [`system-flow.mmd`](system-flow.mmd) / [`system-flow.svg`](system-flow.svg)
for the full diagram.

## Runtime (SST on AWS)

| Component | Tech | Purpose | Status |
|-----------|------|---------|--------|
| **Agent cron** | `sst.aws.Cron` (`rate(2 minutes)`) → Lambda | Docks Jira, runs the pipeline each tick | ✅ Available |
| **Run log** | `sst.aws.Dynamo` | Persists per-run summaries + events | ✅ Available |
| **Dashboard** | `sst.aws.Remix` | Visualizes runs/events, auto-refresh 15s | ✅ Available |
| **Auth/login** | — | UI auth for the dashboard | 🚧 Not yet (public) |

## Pipeline steps

| # | Step | Trigger | Result | Status |
|---|------|---------|--------|--------|
| 0 | **Authenticate** — load Jira API token from env/vault and attach to request | run triggered | authorized client | ✅ Available |
| 1 | **Fetch** — pull all tickets/stories from the Kanban board (JQL search) | authorized | stories cache | ✅ Available |
| 2 | **Read** — read stories that hold `#revise` and are `#undone` | `#revise` + `#undone` | story content + acceptance criteria | ✅ Available |
| 3 | **Revise** — run revise prompt to refine the spec / acceptance criteria | step 2 done | refined story | ✅ Available |
| 4 | **Label revised** — add `#revised`, remove `#undone` when finished | revision ok | `#revised` story | ✅ Available |
| 5 | **Execute** — run code work for stories marked `#ready` | `#ready` | generated code + branch | ✅ Available |
| 6 | **Label implemented** — add `#implemented`, open PR / push branch | work complete | `#implemented` story + PR | ✅ Available |
| 7 | **Report** — post summary back to Jira / Slack | loop done | run summary | ✅ Available |

## Sub-flows

After `#implemented`, stories flow through two gates. See
[`testing-flow.svg`](testing-flow.svg) and [`qa-flow.svg`](qa-flow.svg).

### 🧪 Testing sub-flow ([diagram](testing-flow.mmd))

| Step | Trigger | Pass → | Fail → | Status |
|------|---------|--------|--------|--------|
| Derive test cases from acceptance criteria, judge implementation | `#implemented` (not `#tested`/`#tests-failed`) | `#tested` | `#tests-failed` | ✅ Available (spec-level gate; real exec → TODO) |

### 🔍 QA sub-flow ([diagram](qa-flow.mmd))

| Step | Trigger | Pass → | Fail → | Status |
|------|---------|--------|--------|--------|
| Validate completeness, edge cases, regressions | `#tested` (not `#qa-passed`/`#qa-failed`) | `#qa-passed` + `#done` | `#qa-failed` (removes `#tested`) | ✅ Available |

## Label ↔ Jira workflow mapping

The pipeline is label-driven by default. Set `JIRA_DRIVE_STATUS=true` to *also*
transition issues across your native Jira workflow (additive — labels still apply).

| Outcome | Label(s) | Jira status (default, override via env) |
|---------|----------|------------------------------------------|
| revised | `revised` (−`undone`) | `STATUS_REVISED` (unset) |
| implemented | `implemented` | `In Review` |
| tested | `tested` | `In QA` |
| tests failed | `tests-failed` | `In Progress` |
| qa passed | `qa-passed` + `done` | `Done` |
| qa failed | `qa-failed` (−`tested`) | `In Progress` |

> Transitions only fire if the target status is reachable from the issue's current
> status in your workflow; otherwise the agent logs a warning and continues.
