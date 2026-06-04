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
- [ ] Check out the target repo, apply the generated code, open a real PR
      (GitHub) instead of posting code as a Jira comment.
- [ ] Link PR URL back onto the story and into the dashboard.

## Dashboard
- [ ] **Auth / login** (currently public — do before exposing).
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
