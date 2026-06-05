import { Resource } from "sst";
import { task } from "sst/aws/task";
import {
  config,
  labels,
  loadTenants,
  statusFor,
  type Outcome,
  type Tenant,
} from "./config.js";
import { createJira, type Jira, type Story } from "./jira.js";
import { createLlm } from "./llm.js";
import { loadProjectTenants } from "./projects.js";
import { Run, recordRunnerUsage, type Stage } from "./store.js";

const has = (s: Story, label: string) => s.labels.includes(label);

/** Optionally drive the native Jira workflow (status transition) for an outcome. */
async function maybeTransition(jira: Jira, run: Run, stage: Stage, key: string, outcome: Outcome) {
  if (!config.driveStatus) return;
  const status = statusFor(outcome);
  if (!status) return;
  try {
    if (await jira.transitionTo(key, status)) await run.log(stage, "info", `Transitioned → ${status}`, key);
  } catch (e) {
    await run.log(stage, "warn", `Transition to ${status} failed: ${(e as Error).message}`, key);
  }
}

/** Run the full pipeline for every configured tenant, each fully isolated. */
export async function runAgent(now: string): Promise<void> {
  // Env-configured tenants (TENANTS / JIRA_*) plus user-managed projects from the
  // Projects table (credentials resolved from Secrets Manager).
  const tenants = loadTenants();
  try {
    tenants.push(...(await loadProjectTenants()));
  } catch (e) {
    console.error(`[agent] loading project tenants failed: ${(e as Error).message}`);
  }
  // Tenants are independent — run them sequentially with isolated clients/state.
  for (const tenant of tenants) {
    await runTenant(tenant, now);
  }
}

async function runTenant(tenant: Tenant, now: string): Promise<void> {
  const jira = createJira(tenant.jira); // per-tenant credentials
  const llm = createLlm(tenant.model);
  const run = new Run(tenant.id, now); // per-tenant data partition
  try {
    await run.log("fetch", "info", `[${tenant.id}] Docking Jira: ${tenant.jira.host}`);
    const stories = await jira.searchStories(tenant.jql);
    run.count("fetched", stories.length);
    await run.log("fetch", "success", `Fetched ${stories.length} story(ies)`);

    // --- Stage 1+2: revise -------------------------------------------------
    const toRevise = stories.filter(
      (s) => has(s, labels.revise) && has(s, labels.undone) && !has(s, labels.revised),
    );
    for (const s of toRevise) {
      try {
        await run.log("revise", "info", `Revising "${s.summary}"`, s.key);
        const revised = await llm.reviseStory(s);
        await jira.addComment(s.key, `🤖 Revised specification:\n\n${revised}`);
        await jira.updateLabels(s.key, [labels.revised], [labels.undone]);
        await maybeTransition(jira, run, "revise", s.key, "revised");
        run.count("revised");
        await run.log("revise", "success", `Labeled ${labels.revised}`, s.key);
      } catch (e) {
        await run.log("revise", "error", String((e as Error).message), s.key);
      }
    }

    // --- Stage 3+4: execute (inline or dispatch to isolated Fargate runner) -
    const toImplement = stories.filter(
      (s) =>
        has(s, labels.ready) &&
        !has(s, labels.implemented) &&
        !has(s, labels.dispatched),
    );
    for (const s of toImplement) {
      try {
        if (config.executeMode === "fargate") {
          await dispatchRunner(tenant, s);
          await jira.updateLabels(s.key, [labels.dispatched]);
          await run.log("execute", "info", `Dispatched isolated Fargate runner`, s.key);
        } else {
          await run.log("execute", "info", `Implementing "${s.summary}"`, s.key);
          const work = await llm.implementStory(s);
          await jira.addComment(s.key, `🤖 Generated implementation:\n\n${work}`);
          await jira.updateLabels(s.key, [labels.implemented]);
          await maybeTransition(jira, run, "execute", s.key, "implemented");
          run.count("implemented");
          await run.log("execute", "success", `Labeled ${labels.implemented}`, s.key);
        }
      } catch (e) {
        await run.log("execute", "error", String((e as Error).message), s.key);
      }
    }

    // --- Stage 5: testing sub-flow ----------------------------------------
    const toTest = stories.filter(
      (s) => has(s, labels.implemented) && !has(s, labels.tested) && !has(s, labels.testsFailed),
    );
    for (const s of toTest) {
      try {
        await run.log("testing", "info", `Testing "${s.summary}"`, s.key);
        const v = await llm.testStory(s);
        await jira.addComment(s.key, `🧪 Test review (${v.pass ? "PASS" : "FAIL"}): ${v.summary}\n\n${v.details}`);
        if (v.pass) {
          await jira.updateLabels(s.key, [labels.tested], [labels.testsFailed]);
          await maybeTransition(jira, run, "testing", s.key, "tested");
          run.count("tested");
          await run.log("testing", "success", `Labeled ${labels.tested}`, s.key);
        } else {
          await jira.updateLabels(s.key, [labels.testsFailed]);
          await maybeTransition(jira, run, "testing", s.key, "testsFailed");
          await run.log("testing", "warn", `Tests failed: ${v.summary}`, s.key);
        }
      } catch (e) {
        await run.log("testing", "error", String((e as Error).message), s.key);
      }
    }

    // --- Stage 6: QA sub-flow ---------------------------------------------
    const toQa = stories.filter(
      (s) => has(s, labels.tested) && !has(s, labels.qaPassed) && !has(s, labels.qaFailed),
    );
    for (const s of toQa) {
      try {
        await run.log("qa", "info", `QA "${s.summary}"`, s.key);
        const v = await llm.qaReview(s);
        await jira.addComment(s.key, `🔍 QA review (${v.pass ? "PASS" : "FAIL"}): ${v.summary}\n\n${v.details}`);
        if (v.pass) {
          await jira.updateLabels(s.key, [labels.qaPassed, labels.done], [labels.qaFailed]);
          await maybeTransition(jira, run, "qa", s.key, "qaPassed");
          run.count("qaPassed");
          await run.log("qa", "success", `Labeled ${labels.qaPassed} + ${labels.done}`, s.key);
        } else {
          await jira.updateLabels(s.key, [labels.qaFailed], [labels.tested]);
          await maybeTransition(jira, run, "qa", s.key, "qaFailed");
          await run.log("qa", "warn", `QA failed: ${v.summary}`, s.key);
        }
      } catch (e) {
        await run.log("qa", "error", String((e as Error).message), s.key);
      }
    }

    await run.log(
      "done",
      "success",
      `Done — revised ${toRevise.length}, exec ${toImplement.length}, tested ${toTest.length}, qa ${toQa.length}`,
    );
    await run.finish("ok");
  } catch (e) {
    await run.log("done", "error", String((e as Error).message));
    await run.finish("error");
  }
}

/**
 * Launch an isolated Fargate task for one story. The task gets ONLY this tenant's
 * credentials + target repo via its environment, so tenants never share compute,
 * filesystem, or secrets. The runner posts its own progress back to Jira + the log.
 */
async function dispatchRunner(tenant: Tenant, story: Story): Promise<void> {
  // Second arg = per-run environment overrides (flat record), scoped to this task.
  await task.run(Resource.Runner, {
    TENANT_ID: tenant.id,
    STORY_KEY: story.key,
    STORY_SUMMARY: story.summary,
    STORY_SPEC: story.description,
    TARGET_REPO: tenant.targetRepo ?? "",
    // Per-tenant credentials — scoped to this single task (from Secrets Manager
    // for project-backed tenants, never shared across tenants).
    JIRA_HOST: tenant.jira.host,
    JIRA_EMAIL: tenant.jira.email,
    JIRA_TOKEN: tenant.jira.token,
    GITHUB_TOKEN: tenant.githubToken ?? "",
    ANTHROPIC_MODEL: tenant.model,
  });
  // Count this dispatch for per-project Fargate cost attribution.
  await recordRunnerUsage(tenant.id, new Date().toISOString());
}
