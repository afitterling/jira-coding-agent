/** Central runtime config, read from environment (populated from .env.local). */

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const config = {
  jira: {
    // e.g. "your-org.atlassian.net" (no protocol)
    host: req("JIRA_HOST").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    email: req("JIRA_EMAIL"),
    token: req("JIRA_TOKEN"),
    /** JQL used to "dock" the board. Defaults to label-scoped query. */
    get jql(): string {
      if (process.env.JIRA_JQL) return process.env.JIRA_JQL;
      const { revise, ready, implemented, tested } = labels;
      return (
        `(labels in ("${revise}", "${ready}", "${implemented}", "${tested}"))` +
        ` ORDER BY updated DESC`
      );
    },
    /**
     * When true, the agent also drives the native Jira workflow by transitioning
     * issues to the status mapped for each stage outcome (see `statusFor`).
     * Label updates always happen; transitions are additive.
     */
    driveStatus: (process.env.JIRA_DRIVE_STATUS ?? "false") === "true",
  },
  anthropic: {
    apiKey: req("ANTHROPIC_API_KEY"),
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
  },
};

/** Jira labels cannot contain `#` or spaces, so the `#revise` notation maps to plain tokens. */
export const labels = {
  revise: process.env.LABEL_REVISE ?? "revise",
  undone: process.env.LABEL_UNDONE ?? "undone",
  revised: process.env.LABEL_REVISED ?? "revised",
  ready: process.env.LABEL_READY ?? "ready",
  implemented: process.env.LABEL_IMPLEMENTED ?? "implemented",
  // --- testing sub-flow ---
  tested: process.env.LABEL_TESTED ?? "tested",
  testsFailed: process.env.LABEL_TESTS_FAILED ?? "tests-failed",
  // --- QA sub-flow ---
  qaPassed: process.env.LABEL_QA_PASSED ?? "qa-passed",
  qaFailed: process.env.LABEL_QA_FAILED ?? "qa-failed",
  done: process.env.LABEL_DONE ?? "done",
};

/**
 * Maps a stage outcome to a native Jira workflow status name. Only used when
 * `config.jira.driveStatus` is true. Override any of these via env to match your
 * board's columns (e.g. STATUS_IMPLEMENTED="In Review").
 */
export type Outcome =
  | "revised"
  | "implemented"
  | "tested"
  | "testsFailed"
  | "qaPassed"
  | "qaFailed";

export function statusFor(outcome: Outcome): string | undefined {
  const map: Record<Outcome, string | undefined> = {
    revised: process.env.STATUS_REVISED,
    implemented: process.env.STATUS_IMPLEMENTED ?? "In Review",
    tested: process.env.STATUS_TESTED ?? "In QA",
    testsFailed: process.env.STATUS_TESTS_FAILED ?? "In Progress",
    qaPassed: process.env.STATUS_QA_PASSED ?? "Done",
    qaFailed: process.env.STATUS_QA_FAILED ?? "In Progress",
  };
  return map[outcome];
}
