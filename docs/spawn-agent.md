# Spawning a Claude Opus coding agent

How to initiate an autonomous coding agent (Claude Opus) that works on a project —
and the compute options, including EC2 boot-up.

## TL;DR — do you need an EC2 instance?

**No, not necessarily.** Anthropic's **Managed Agents API** provisions ephemeral
Linux **cloud sandboxes** where the agent runs `bash`, edits files, runs tests, etc.
Your code is just a thin client that calls the API — it can run in a Lambda, a
container, or locally. EC2 is only one of several places to run that client, and is
optional.

You'd reach for self-managed compute (EC2/Fargate) when you want the agent to operate
on **your** machine/filesystem/network (private repos, internal services, long-lived
caches) rather than Anthropic's hosted sandbox.

## The agent client (headless, autonomous, Opus)

Self-contained — only needs `@anthropic-ai/sdk` and `ANTHROPIC_API_KEY` (Node 18+).
No Claude Code CLI required.

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 1. Agent: Opus + the coding toolset (bash, read, write, edit, glob, grep, web_fetch)
const agent = await client.beta.agents.create({
  name: "jira-coding-agent",
  model: "claude-opus-4-8",
  system: "You are a senior engineer. Implement the task, run tests, keep changes minimal.",
  tools: [
    {
      type: "agent_toolset_20260401",
      // Fully autonomous — no approval prompts:
      default_config: { permission_policy: { type: "always_allow" } },
    },
  ],
});

// 2. Environment (cloud sandbox)
const environment = await client.beta.environments.create({
  name: "coding-env",
  config: { type: "cloud", networking: { type: "unrestricted" } },
});

// 3. Session + drive it
const session = await client.beta.sessions.create({
  agent: agent.id,
  environment_id: environment.id,
  title: "JIRA-123",
});

const stream = await client.beta.sessions.events.stream(session.id);
await client.beta.sessions.events.send(session.id, {
  events: [{
    type: "user.message",
    content: [{
      type: "text",
      text: "Clone https://github.com/acme/app, implement the spec below, run the test suite, open a PR.\n\n<spec…>",
    }],
  }],
});

for await (const event of stream) {
  if (event.type === "agent.message") for (const b of event.content) process.stdout.write(b.text);
  else if (event.type === "agent.tool_use") console.log(`[tool: ${event.name}]`);
  else if (event.type === "session.status_idle") break;
}
```

To work on a repo: have the agent `git clone` it inside the sandbox (above), or use
**self-hosted sandboxes** to point execution at your own machine.

> `permission_policy` defaults to `always_allow`, so autonomous runs work out of the
> box. Use `{ type: "always_ask" }` to require approval (then handle `requires_action`).

## Where to run the client — compute options

| Option | Manages a VM? | Good for | Notes |
|--------|---------------|----------|-------|
| **Managed sandbox only** | No | Most cases | Client runs anywhere; execution in Anthropic's sandbox |
| **AWS Lambda** | No | Short dispatch | 15-min cap, ephemeral FS — fine to *kick off* a session, poor for long local builds |
| **AWS Fargate (ECS)** | No | Long agent runs on your infra | Serverless containers; clone repo, run tests, no VM to patch |
| **Vercel Sandbox** | No | Running generated/untrusted code | Ephemeral microVMs, GA Jan 2026 |
| **EC2** | **Yes** | Full control, persistent caches, special tooling | You patch/secure/stop it — see below |

For this repo, the natural wiring: the 2-min **cron Lambda** detects a `#ready` story
and **dispatches** a job (Fargate task / EC2 run / managed session) that does the real
code work and opens a PR, then writes results back to the run log. (See `TODO.md`.)

## EC2 boot-up (the self-managed path)

A "mini" instance is plenty — `t3.micro`/`t4g.small`. The pattern: launch an instance
whose **user-data** installs Node, pulls a runner, and executes the agent, then
self-terminates.

### 1. Bootstrap (user-data) — `ec2-bootstrap.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
exec > /var/log/agent-boot.log 2>&1

# Node 20 (Amazon Linux 2023)
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs git

# Secrets via SSM Parameter Store (don't bake keys into user-data)
export ANTHROPIC_API_KEY="$(aws ssm get-parameter --name /agent/ANTHROPIC_API_KEY --with-decryption --query Parameter.Value --output text)"

# Run the agent client
git clone https://github.com/afitterling/jira-coding-agent /opt/agent
cd /opt/agent && npm ci
node scripts/runner.mjs "${STORY_KEY:-}"

# Self-terminate to stop billing
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
IID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
aws ec2 terminate-instances --instance-ids "$IID"
```

### 2. Launch the instance

```bash
aws ec2 run-instances \
  --image-id resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --instance-type t3.micro \
  --iam-instance-profile Name=agent-runner \
  --instance-initiated-shutdown-behavior terminate \
  --user-data file://ec2-bootstrap.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=jira-coding-agent}]'
```

### 3. Requirements

- **IAM instance profile** `agent-runner` with: `ssm:GetParameter` (the API key),
  and whatever the job needs (e.g. `ec2:TerminateInstances` on self for cleanup).
- **Secrets** in SSM Parameter Store (SecureString) — never in user-data.
- **Outbound HTTPS** to `api.anthropic.com` and your git host.
- **Cost control**: `instance-initiated-shutdown-behavior terminate` + self-terminate
  so a finished/hung run doesn't bill indefinitely.

### Same idea, less ops: SST-native

Inside this repo's SST app you can avoid hand-rolled EC2 by using a Fargate task:

```ts
// sst.config.ts (sketch)
const cluster = new sst.aws.Cluster("AgentCluster", { vpc });
const runner = new sst.aws.Task("AgentRunner", {
  cluster,
  image: { dockerfile: "runner/Dockerfile" }, // node + @anthropic-ai/sdk + git
  environment: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY! },
});
// The cron Lambda calls runner.task.run({ STORY_KEY }) when a story is #ready.
```

Fargate gives you the "spin up compute, do the work, scale to zero" behavior of EC2
without an instance to patch, stop, or secure.

---

> **Security note:** an autonomous agent with `always_allow` + repo write + a git
> token is powerful. Run it against scoped credentials, in an isolated
> account/sandbox, and gate the PR behind human review (the QA/testing sub-flows help).
