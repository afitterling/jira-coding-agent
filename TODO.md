# TODO

Open tickets. (The previous detailed roadmap is preserved in git history.)

## 1. Integrate AI coder in Jira flow
**Status:** open

Wire the AI coder (Claude Code CLI runner) into the Jira pipeline so a story
moving to `implement` is automatically picked up, checked out, implemented, and
returned as a PR.

- Trigger: user sets a story to `implement` (label/status) → agent dispatches the
  isolated Fargate runner for that story.
- Runner checks out the project's GitHub repo, applies the changes, runs tests,
  opens a PR, and streams progress back to Jira + the run log.
- Repo URL + credentials come from per-project config (Secrets Manager), not env.

**Done when:** setting a story to `implement` results in a real PR against the
project's repo, end-to-end, against a live repo.

## 2. Define flow
**Status:** open

Define and document the end-to-end state machine the agent drives, so labels,
statuses, and transitions are unambiguous.

- Map every stage: `revise` → `revised` → `ready`/`implement` → `implemented` →
  `tested` / `tests-failed` → `qa-passed` + `done` / `qa-failed`.
- Specify entry/exit conditions, who triggers each transition (human vs. agent),
  and the label ↔ native Jira status mapping.
- Capture as a diagram + written spec.

**Done when:** the flow is documented and matches the implemented pipeline.
