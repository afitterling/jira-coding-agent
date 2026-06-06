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

## 3. Add Haystack + LangChain RAG layer (Fargate-first)
**Status:** open

Introduce Haystack and LangChain pipelines on AWS Fargate to support
retrieval-augmented generation (RAG) and complex LLM query orchestration.
Start by embedding this capability in the marketing website messaging in both
English and German, and keep language switching in the top navigation as an
icon-based dropdown.

- Position Haystack + LangChain as the retrieval/reasoning layer in Synapse and
  use-case sections.
- Ensure EN/DE copy stays structurally aligned for type-safe i18n.
- Keep the language switcher accessible and compact across desktop/mobile nav.

**Done when:** marketing copy and locale UX communicate the requirement clearly,
and backend integration work can proceed against this documented target.
