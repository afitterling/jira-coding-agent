/// <reference path="./.sst/platform/config.d.ts" />

/**
 * jira-coding-agent — SST (Ion) infrastructure.
 *
 * - DynamoDB table         : tenant-isolated run + event log (dashboard reads it)
 * - Cron (rate 2 minutes)  : docks each tenant's Jira and runs the pipeline
 * - Fargate Task "Runner"  : isolated per-story coding agent (Claude Code CLI)
 * - Remix site             : read-only dashboard over the run log
 *
 * Secrets/config come from `.env.local` (loaded by SST). Multi-tenant: set TENANTS
 * (JSON). Single-tenant: set JIRA_*. See docs/tenant-isolation.md.
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
    // --- Label / status / mode config (passed to cron + runner) ---------------
    const labels: Record<string, string> = {
      LABEL_REVISE: process.env.LABEL_REVISE ?? "revise",
      LABEL_UNDONE: process.env.LABEL_UNDONE ?? "undone",
      LABEL_REVISED: process.env.LABEL_REVISED ?? "revised",
      LABEL_READY: process.env.LABEL_READY ?? "ready",
      LABEL_IMPLEMENTED: process.env.LABEL_IMPLEMENTED ?? "implemented",
      LABEL_DISPATCHED: process.env.LABEL_DISPATCHED ?? "agent-dispatched",
      LABEL_TESTED: process.env.LABEL_TESTED ?? "tested",
      LABEL_TESTS_FAILED: process.env.LABEL_TESTS_FAILED ?? "tests-failed",
      LABEL_QA_PASSED: process.env.LABEL_QA_PASSED ?? "qa-passed",
      LABEL_QA_FAILED: process.env.LABEL_QA_FAILED ?? "qa-failed",
      LABEL_DONE: process.env.LABEL_DONE ?? "done",
    };

    const pass = (k: string) => process.env[k] ?? "";
    const sharedEnv: Record<string, string> = {
      ANTHROPIC_API_KEY: pass("ANTHROPIC_API_KEY"),
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
      // Single-tenant fallback (ignored when TENANTS is set):
      JIRA_HOST: pass("JIRA_HOST"),
      JIRA_EMAIL: pass("JIRA_EMAIL"),
      JIRA_TOKEN: pass("JIRA_TOKEN"),
      JIRA_JQL: pass("JIRA_JQL"),
      TARGET_REPO: pass("TARGET_REPO"),
      // Multi-tenant config (JSON array):
      TENANTS: pass("TENANTS"),
      // Behaviour:
      JIRA_DRIVE_STATUS: process.env.JIRA_DRIVE_STATUS ?? "false",
      EXECUTE_MODE: process.env.EXECUTE_MODE ?? "inline",
      ...labels,
    };

    // --- Tenant-isolated run/event log ---------------------------------------
    const runs = new sst.aws.Dynamo("Runs", {
      fields: { pk: "string", sk: "string" },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
    });

    // --- User-managed projects (metadata; credentials live in Secrets Manager)
    const projects = new sst.aws.Dynamo("Projects", {
      fields: { pk: "string", sk: "string" },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
    });

    // Namespaced secret prefix + the ARN pattern both web (write) and cron (read)
    // are scoped to. Per-stage so dev/prod credentials never collide.
    const secretPrefix = `${$app.name}/${$app.stage}/project`;
    const secretArnPattern = `arn:aws:secretsmanager:*:*:secret:${secretPrefix}/*`;

    // --- Auth: Cognito user pool (self-signup + email confirmation) ----------
    const userPool = new sst.aws.CognitoUserPool("Auth", {
      usernames: ["email"],
      transform: {
        userPool: (args) => {
          // Cognito emails a confirmation code on signup and self-signup is allowed.
          args.autoVerifiedAttributes = ["email"];
          args.adminCreateUserConfig = { allowAdminCreateUserOnly: false };
        },
      },
    });
    // Public client (no secret): the Remix server calls the unauthenticated
    // SignUp / ConfirmSignUp / InitiateAuth APIs, so no SECRET_HASH is needed.
    const userPoolClient = userPool.addClient("WebClient", {
      transform: {
        client: (args) => {
          args.generateSecret = false;
          args.explicitAuthFlows = [
            "ALLOW_USER_PASSWORD_AUTH",
            "ALLOW_REFRESH_TOKEN_AUTH",
          ];
        },
      },
    });
    // Members of this group are admins (see all costs across projects). Add users
    // via the console or `aws cognito-idp admin-add-user-to-group`.
    new aws.cognito.UserGroup("AdminGroup", {
      userPoolId: userPool.id,
      name: "admin",
      description: "Can view all AWS costs and per-project cost across all owners",
    });

    // --- Network + cluster for the runner ------------------------------------
    // NAT lets the Fargate task reach api.anthropic.com / git hosts from a
    // private subnet. Each task is its own isolated microVM (no shared FS).
    const vpc = new sst.aws.Vpc("Vpc", { nat: "ec2" });
    const cluster = new sst.aws.Cluster("Cluster", { vpc });

    // --- Isolated per-story coding agent (Claude Code CLI in the image) ------
    const runner = new sst.aws.Task("Runner", {
      cluster,
      link: [runs],
      image: { context: "runner" },
      memory: "2 GB",
      cpu: "1 vCPU",
      environment: {
        ANTHROPIC_API_KEY: pass("ANTHROPIC_API_KEY"),
        GITHUB_TOKEN: pass("GITHUB_TOKEN"),
        ...labels,
        // Per-tenant values (TENANT_ID, STORY_*, JIRA_*, TARGET_REPO) are injected
        // at dispatch time by task.run() — never baked into the image.
      },
    });

    // --- The "beast": cron-driven, multi-tenant agent ------------------------
    new sst.aws.Cron("Agent", {
      schedule: "rate(2 minutes)",
      function: {
        handler: "src/cron.handler",
        // read the log + dispatch runner tasks + read project metadata
        link: [runs, runner, projects],
        // resolve per-project credentials at dispatch time.
        permissions: [{ actions: ["secretsmanager:GetSecretValue"], resources: [secretArnPattern] }],
        timeout: "5 minutes",
        memory: "512 MB",
        environment: { ...sharedEnv, SECRET_PREFIX: secretPrefix },
        nodejs: { install: ["@anthropic-ai/sdk"] },
      },
    });

    // --- Remix dashboard ------------------------------------------------------
    const web = new sst.aws.Remix("Web", {
      path: "web",
      link: [runs, projects],
      permissions: [
        // Read this app's cost across all stages from Cost Explorer (public dashboard).
        { actions: ["ce:GetCostAndUsage", "ce:GetTags"], resources: ["*"] },
        // Manage per-project credential secrets (create on add, delete on remove).
        {
          actions: ["secretsmanager:CreateSecret", "secretsmanager:PutSecretValue", "secretsmanager:DeleteSecret", "secretsmanager:TagResource"],
          resources: [secretArnPattern],
        },
      ],
      environment: {
        ...labels,
        // Tenant ids the dashboard offers in its selector.
        TENANT_IDS: process.env.TENANT_IDS ?? "default",
        // Scope the cost dashboard to exactly this app (matches the sst:app tag).
        SST_APP_NAME: $app.name,
        // Cognito (signup / confirm / login).
        COGNITO_USER_POOL_ID: userPool.id,
        COGNITO_CLIENT_ID: userPoolClient.id,
        // Namespace for per-project credential secrets.
        SECRET_PREFIX: secretPrefix,
      },
    });

    return {
      dashboard: web.url,
      table: runs.name,
      userPool: userPool.id,
      userPoolClient: userPoolClient.id,
    };
  },
});
