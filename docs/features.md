# Features

The Jira coding agent processes stories from a Kanban board through a label-driven
pipeline. See [`system-flow.mmd`](system-flow.mmd) / [`system-flow.svg`](system-flow.svg)
for the full diagram.

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

## Coming soon

| Step | Description | Status |
|------|-------------|--------|
| **QA** | Automated QA pass on implemented stories — validate against acceptance criteria, sanity-check generated code, flag regressions before merge | 🚧 Coming soon |
| **Testing** | Generate and run unit / integration tests for each implemented story; gate `#implemented` on a green test suite | 🚧 Coming soon |

> **Note:** Until QA and Testing land, stories move to `#implemented` on code-work
> completion only. Manual review is recommended before merging the opened PRs.
