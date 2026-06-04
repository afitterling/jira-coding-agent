# TODO

Roadmap for the Jira coding agent. Checked = shipped.

## Core pipeline
- [x] Dock Jira board (token from `.env.local`), JQL fetch
- [x] Revise sub-flow (`#revise` + `#undone` → `#revised`)
- [x] Execute sub-flow (`#ready` → `#implemented`)
- [x] Cron every 2 min (SST `sst.aws.Cron`)
- [x] DynamoDB run/event log + Remix dashboard

## Testing & QA sub-flows
- [x] Testing gate (`#implemented` → `#tested` | `#tests-failed`)
- [x] QA gate (`#tested` → `#qa-passed` + `#done` | `#qa-failed`)
- [x] Optional native Jira workflow transitions (`JIRA_DRIVE_STATUS`)
- [ ] **Real test execution** — currently a spec-level LLM gate. Run the actual
      suite via CI or Vercel Sandbox against the generated code, feed results back
      into the verdict.
- [ ] Persist generated tests to the repo / PR instead of only commenting.

## Execute sub-flow hardening
- [x] Isolated Fargate runner (`sst.aws.Task`) that clones the repo, drives the
      **Claude Code CLI** (Opus), runs tests, and opens a real GitHub PR
      (`EXECUTE_MODE=fargate`).
- [x] Runner streams progress back to Jira as comments + the run log.
- [x] `agent-dispatched` label prevents double-dispatch; cleared on done/fail.
- [ ] Verify the runner end-to-end against a live repo (needs AWS deploy).
- [ ] Surface the PR URL as a first-class field in the dashboard (not just a log line).

## Multi-tenancy — see docs/tenant-isolation.md
- [x] Per-tenant Jira clients (`createJira(auth)`); creds never shared.
- [x] Tenant-prefixed DynamoDB keys (`T#<tenant>#…`); dashboard tenant selector.
- [x] Per-story isolated Fargate task (own microVM + scoped creds).
- [ ] Resolve per-tenant tokens from Secrets Manager/SSM instead of inline `TENANTS`.
- [ ] Optional per-tenant Anthropic key for usage isolation.
- [ ] Parallelize tenants per cron tick (bounded concurrency) for large fleets.

## Dashboard
- [ ] **Auth / login** (currently public — anyone can switch tenant; do before exposing).
- [ ] Manual "trigger run now" button (invoke the agent Lambda).
- [ ] Per-story timeline view across runs.
- [ ] Render the generated test cases / QA findings inline.

## Ops
- [ ] Move secrets from `.env.local` env vars to `sst.Secret`.
- [ ] Dead-letter / alerting on repeated run errors.
- [ ] Rate-limit Anthropic calls; batch large boards.
- [ ] Idempotency guard if a run overruns the 2-min cron interval.

## Docs
- [x] System flow + testing/QA sub-flow diagrams (`docs/*.mmd` + `.svg`)
- [ ] Sequence diagram for the Jira ↔ agent ↔ dashboard round-trip.
