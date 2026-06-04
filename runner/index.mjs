/**
 * Isolated per-story coding-agent runner (one Fargate task = one story = one tenant).
 *
 * Tenant isolation: this task receives ONLY one tenant's credentials + target repo
 * via its environment (injected by task.run). It runs in its own microVM with no
 * shared filesystem or network with other tenants' tasks.
 *
 * Flow: clone target repo -> drive the Claude Code CLI (Opus) to implement the
 * story -> run tests -> open a PR -> stream progress back to Jira + the run log.
 */
import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const env = process.env;
const {
  TENANT_ID = "default",
  STORY_KEY = "",
  STORY_SUMMARY = "",
  STORY_SPEC = "",
  TARGET_REPO = "",
  JIRA_HOST = "",
  JIRA_EMAIL = "",
  JIRA_TOKEN = "",
  GITHUB_TOKEN = "",
  ANTHROPIC_MODEL = "claude-opus-4-8",
} = env;

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = Resource.Runs.name;
const runId = `${new Date().toISOString()}-runner`;
let seq = 0;

// --- logging: both to the run log (dashboard) and back to Jira -----------------
async function logEvent(level, message) {
  const ts = new Date().toISOString();
  console.log(`[${TENANT_ID}][runner/${level}] ${STORY_KEY} ${message}`);
  await doc.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        pk: `T#${TENANT_ID}#RUN#${runId}`,
        sk: `${ts}#${String(seq++).padStart(4, "0")}`,
        ts,
        level,
        stage: "execute",
        message,
        issueKey: STORY_KEY,
      },
    }),
  ).catch((e) => console.error("log write failed", e));
}

function adf(text) {
  return {
    type: "doc",
    version: 1,
    content: text.split("\n").map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    })),
  };
}

async function jiraComment(text) {
  const res = await fetch(`https://${JIRA_HOST}/rest/api/3/issue/${STORY_KEY}/comment`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: adf(text) }),
  });
  if (!res.ok) console.error("jira comment failed", res.status, await res.text());
}

async function jiraLabels(add = [], remove = []) {
  const res = await fetch(`https://${JIRA_HOST}/rest/api/3/issue/${STORY_KEY}`, {
    method: "PUT",
    headers: {
      Authorization: "Basic " + Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      update: { labels: [...add.map((a) => ({ add: a })), ...remove.map((r) => ({ remove: r }))] },
    }),
  });
  if (!res.ok) console.error("jira label update failed", res.status, await res.text());
}

/** Stream a message to BOTH Jira and the run log. */
async function notify(level, message) {
  await Promise.all([logEvent(level, message), jiraComment(`🏃 ${message}`)]);
}

async function main() {
  await notify("info", `Runner started for ${STORY_KEY}: ${STORY_SUMMARY}`);

  if (!TARGET_REPO) {
    await notify("error", "No TARGET_REPO configured for this tenant — aborting.");
    process.exit(1);
  }

  const work = mkdtempSync(join(tmpdir(), `${TENANT_ID}-${STORY_KEY}-`));
  const branch = `agent/${STORY_KEY.toLowerCase()}`;

  try {
    // Clone with the tenant's GitHub token (scoped to this task only).
    const cloneUrl = TARGET_REPO.replace("https://", `https://x-access-token:${GITHUB_TOKEN}@`);
    execSync(`git clone --depth 1 ${cloneUrl} ${work}`, { stdio: "inherit" });
    execSync(`git -C ${work} checkout -b ${branch}`, { stdio: "inherit" });
    await notify("info", `Cloned ${TARGET_REPO} on ${branch}`);

    // Drive the Claude Code CLI headlessly (print mode, autonomous).
    const prompt =
      `Implement Jira story ${STORY_KEY}: ${STORY_SUMMARY}\n\n` +
      `Specification:\n${STORY_SPEC}\n\n` +
      `Make the changes, run the project's tests, and ensure they pass. ` +
      `Keep the diff minimal and focused.`;
    const out = execFileSync(
      "claude",
      ["-p", prompt, "--permission-mode", "bypassPermissions", "--model", ANTHROPIC_MODEL],
      { cwd: work, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
    await notify("info", `Agent finished. Summary:\n${out.slice(0, 4000)}`);

    // Commit + push + open a PR.
    execSync(`git -C ${work} add -A`, { stdio: "inherit" });
    execSync(`git -C ${work} -c user.email=agent@local -c user.name="Coding Agent" ` +
      `commit -m "${STORY_KEY}: ${STORY_SUMMARY}"`, { stdio: "inherit" });
    execSync(`git -C ${work} push -u origin ${branch}`, { stdio: "inherit" });
    const prUrl = execSync(
      `gh pr create --title "${STORY_KEY}: ${STORY_SUMMARY}" ` +
        `--body "Automated implementation for ${STORY_KEY}." --head ${branch}`,
      { cwd: work, encoding: "utf8", env: { ...env, GH_TOKEN: GITHUB_TOKEN } },
    ).trim();

    await jiraComment(`✅ Implemented ${STORY_KEY} — PR: ${prUrl}`);
    await jiraLabels([env.LABEL_IMPLEMENTED ?? "implemented"], [env.LABEL_DISPATCHED ?? "agent-dispatched"]);
    await logEvent("success", `Opened PR ${prUrl}`);
  } catch (e) {
    await notify("error", `Runner failed: ${e.message}`);
    // Drop the dispatched marker so the story can be retried next cron tick.
    await jiraLabels([], [env.LABEL_DISPATCHED ?? "agent-dispatched"]);
    process.exit(1);
  }
}

main();
