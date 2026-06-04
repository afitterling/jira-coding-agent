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
      const { revise, ready } = labels;
      return `(labels = "${revise}" OR labels = "${ready}") ORDER BY updated DESC`;
    },
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
};
