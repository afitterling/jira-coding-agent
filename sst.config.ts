/// <reference path="./.sst/platform/config.d.ts" />

/**
 * jira-coding-agent — SST (Ion) infrastructure.
 *
 * - DynamoDB table         : run + event log (what the dashboard visualizes)
 * - Cron (rate 2 minutes)  : "docks" Jira and runs the revise/implement pipeline
 * - Remix site             : read-only dashboard over the run log
 *
 * Secrets/config are sourced from `.env.local` (loaded automatically by SST).
 * No auth/login yet — the dashboard is public for now.
 */
export default $config({
  app(input) {
    return {
      name: "jira-coding-agent",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage ?? ""),
      home: "aws",
    };
  },
  async run() {
    // --- Config from .env.local (SST loads it into process.env) ---------------
    const labels = {
      LABEL_REVISE: process.env.LABEL_REVISE ?? "revise",
      LABEL_UNDONE: process.env.LABEL_UNDONE ?? "undone",
      LABEL_REVISED: process.env.LABEL_REVISED ?? "revised",
      LABEL_READY: process.env.LABEL_READY ?? "ready",
      LABEL_IMPLEMENTED: process.env.LABEL_IMPLEMENTED ?? "implemented",
    };

    const agentEnv: Record<string, string> = {
      JIRA_HOST: process.env.JIRA_HOST ?? "",
      JIRA_EMAIL: process.env.JIRA_EMAIL ?? "",
      JIRA_TOKEN: process.env.JIRA_TOKEN ?? "",
      JIRA_JQL: process.env.JIRA_JQL ?? "",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
      ...labels,
    };

    // --- Run/event log --------------------------------------------------------
    const runs = new sst.aws.Dynamo("Runs", {
      fields: { pk: "string", sk: "string" },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
    });

    // --- The "beast": cron-driven agent --------------------------------------
    new sst.aws.Cron("Agent", {
      schedule: "rate(2 minutes)",
      function: {
        handler: "src/cron.handler",
        link: [runs],
        timeout: "5 minutes",
        memory: "512 MB",
        environment: agentEnv,
        nodejs: { install: ["@anthropic-ai/sdk"] },
      },
    });

    // --- Remix dashboard ------------------------------------------------------
    const web = new sst.aws.Remix("Web", {
      path: "web",
      link: [runs],
      environment: labels,
    });

    return {
      dashboard: web.url,
      table: runs.name,
    };
  },
});
