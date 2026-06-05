/** Central runtime config, read from environment (populated from .env.local). */

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export interface JiraAuth {
  host: string; // e.g. "your-org.atlassian.net" (no protocol)
  email: string;
  token: string;
}

/** A single isolated tenant: its own Jira site, credentials, board, and target repo. */
export interface Tenant {
  id: string;
  jira: JiraAuth;
  jql: string;
  model: string;
  /** Repo the agent operates on for this tenant (used by the Fargate runner). */
  targetRepo?: string;
  /** GitHub token for cloning + opening PRs (used by the Fargate runner). */
  githubToken?: string;
}

export const normHost = (h: string) => h.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function defaultJql(): string {
  const { revise, ready, implemented, tested } = labels;
  return `(labels in ("${revise}", "${ready}", "${implemented}", "${tested}")) ORDER BY updated DESC`;
}

/**
 * Load tenants. Two modes:
 *  - Multi-tenant: `TENANTS` env = JSON array of
 *      { id, jiraHost, jiraEmail, jiraToken, jql?, model?, targetRepo? }
 *  - Single-tenant (default): one tenant "default" from the JIRA_* / ANTHROPIC_* vars.
 *
 * Secrets are per-tenant — never shared across tenants. In production prefer
 * resolving `jiraToken` from a per-tenant secret store (see docs/tenant-isolation.md).
 */
export function loadTenants(): Tenant[] {
  const sharedModel = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
  if (process.env.TENANTS) {
    const raw = JSON.parse(process.env.TENANTS) as Array<Record<string, string>>;
    return raw.map((t) => {
      if (!t.id || !t.jiraHost || !t.jiraEmail || !t.jiraToken) {
        throw new Error(`TENANTS entry missing id/jiraHost/jiraEmail/jiraToken: ${JSON.stringify(t)}`);
      }
      return {
        id: t.id,
        jira: { host: normHost(t.jiraHost), email: t.jiraEmail, token: t.jiraToken },
        jql: t.jql || defaultJql(),
        model: t.model || sharedModel,
        targetRepo: t.targetRepo,
        githubToken: t.githubToken || process.env.GITHUB_TOKEN,
      };
    });
  }
  // No env-based Jira config — tenants come solely from the Projects table
  // (see src/projects.ts). Don't throw; just contribute no env tenant.
  if (!process.env.JIRA_HOST) return [];
  // Single-tenant fallback.
  return [
    {
      id: process.env.TENANT_ID || "default",
      jira: { host: normHost(req("JIRA_HOST")), email: req("JIRA_EMAIL"), token: req("JIRA_TOKEN") },
      jql: process.env.JIRA_JQL || defaultJql(),
      model: sharedModel,
      targetRepo: process.env.TARGET_REPO,
      githubToken: process.env.GITHUB_TOKEN,
    },
  ];
}

/** Shared (tenant-independent) config. */
export const config = {
  anthropic: { apiKey: req("ANTHROPIC_API_KEY") },
  /** Drive native Jira workflow transitions in addition to labels. */
  driveStatus: (process.env.JIRA_DRIVE_STATUS ?? "false") === "true",
  /** "inline" = implement in-process; "fargate" = dispatch an isolated runner task. */
  executeMode: (process.env.EXECUTE_MODE ?? "inline") as "inline" | "fargate",
};

/** Jira labels cannot contain `#` or spaces, so the `#revise` notation maps to plain tokens. */
export const labels = {
  revise: process.env.LABEL_REVISE ?? "revise",
  undone: process.env.LABEL_UNDONE ?? "undone",
  revised: process.env.LABEL_REVISED ?? "revised",
  ready: process.env.LABEL_READY ?? "ready",
  implemented: process.env.LABEL_IMPLEMENTED ?? "implemented",
  // dispatched: transient marker so a #ready story isn't re-dispatched while a runner works it.
  dispatched: process.env.LABEL_DISPATCHED ?? "agent-dispatched",
  // --- testing sub-flow ---
  tested: process.env.LABEL_TESTED ?? "tested",
  testsFailed: process.env.LABEL_TESTS_FAILED ?? "tests-failed",
  // --- QA sub-flow ---
  qaPassed: process.env.LABEL_QA_PASSED ?? "qa-passed",
  qaFailed: process.env.LABEL_QA_FAILED ?? "qa-failed",
  done: process.env.LABEL_DONE ?? "done",
};

export type Outcome =
  | "revised"
  | "implemented"
  | "tested"
  | "testsFailed"
  | "qaPassed"
  | "qaFailed";

/** Maps a stage outcome to a native Jira workflow status name (used when driveStatus). */
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
