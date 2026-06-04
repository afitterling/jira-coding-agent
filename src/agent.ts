import { config, labels, statusFor, type Outcome } from "./config.js";
import {
  searchStories,
  updateLabels,
  addComment,
  transitionTo,
  type Story,
} from "./jira.js";
import { reviseStory, implementStory, testStory, qaReview } from "./llm.js";
import { Run, type Stage } from "./store.js";

const has = (s: Story, label: string) => s.labels.includes(label);

/** Optionally drive the native Jira workflow (status transition) for an outcome. */
async function maybeTransition(
  run: Run,
  stage: Stage,
  key: string,
  outcome: Outcome,
): Promise<void> {
  if (!config.jira.driveStatus) return;
  const status = statusFor(outcome);
  if (!status) return;
  try {
    const moved = await transitionTo(key, status);
    if (moved) await run.log(stage, "info", `Transitioned → ${status}`, key);
  } catch (e) {
    await run.log(stage, "warn", `Transition to ${status} failed: ${(e as Error).message}`, key);
  }
}

/**
 * One pass of the pipeline. Each stage is gated by labels and is idempotent
 * (skips work already done), so re-running every 2 minutes is safe.
 *
 *   1+2  revise  : #revise + #undone        -> #revised  (- #undone)
 *   3+4  execute : #ready                    -> #implemented
 *   5    testing : #implemented              -> #tested | #tests-failed
 *   6    qa      : #tested                   -> #qa-passed + #done | #qa-failed
 */
export async function runAgent(now: string): Promise<void> {
  const run = new Run(now);
  try {
    await run.log("fetch", "info", `Docking Jira board: ${config.jira.host}`);
    const stories = await searchStories(config.jira.jql);
    run.count("fetched", stories.length);
    await run.log("fetch", "success", `Fetched ${stories.length} story(ies)`);

    // --- Stage 1+2: revise -------------------------------------------------
    const toRevise = stories.filter(
      (s) => has(s, labels.revise) && has(s, labels.undone) && !has(s, labels.revised),
    );
    for (const s of toRevise) {
      try {
        await run.log("revise", "info", `Revising "${s.summary}"`, s.key);
        const revised = await reviseStory(s);
        await addComment(s.key, `🤖 Revised specification:\n\n${revised}`);
        await updateLabels(s.key, [labels.revised], [labels.undone]);
        await maybeTransition(run, "revise", s.key, "revised");
        run.count("revised");
        await run.log("revise", "success", `Labeled ${labels.revised}`, s.key);
      } catch (e) {
        await run.log("revise", "error", String((e as Error).message), s.key);
      }
    }

    // --- Stage 3+4: execute ------------------------------------------------
    const toImplement = stories.filter(
      (s) => has(s, labels.ready) && !has(s, labels.implemented),
    );
    for (const s of toImplement) {
      try {
        await run.log("execute", "info", `Implementing "${s.summary}"`, s.key);
        const work = await implementStory(s);
        await addComment(s.key, `🤖 Generated implementation:\n\n${work}`);
        await updateLabels(s.key, [labels.implemented]);
        await maybeTransition(run, "execute", s.key, "implemented");
        run.count("implemented");
        await run.log("execute", "success", `Labeled ${labels.implemented}`, s.key);
      } catch (e) {
        await run.log("execute", "error", String((e as Error).message), s.key);
      }
    }

    // --- Stage 5: testing sub-flow ----------------------------------------
    const toTest = stories.filter(
      (s) =>
        has(s, labels.implemented) &&
        !has(s, labels.tested) &&
        !has(s, labels.testsFailed),
    );
    for (const s of toTest) {
      try {
        await run.log("testing", "info", `Testing "${s.summary}"`, s.key);
        const v = await testStory(s);
        await addComment(s.key, `🧪 Test review (${v.pass ? "PASS" : "FAIL"}): ${v.summary}\n\n${v.details}`);
        if (v.pass) {
          await updateLabels(s.key, [labels.tested], [labels.testsFailed]);
          await maybeTransition(run, "testing", s.key, "tested");
          run.count("tested");
          await run.log("testing", "success", `Labeled ${labels.tested}`, s.key);
        } else {
          await updateLabels(s.key, [labels.testsFailed]);
          await maybeTransition(run, "testing", s.key, "testsFailed");
          await run.log("testing", "warn", `Tests failed: ${v.summary}`, s.key);
        }
      } catch (e) {
        await run.log("testing", "error", String((e as Error).message), s.key);
      }
    }

    // --- Stage 6: QA sub-flow ---------------------------------------------
    const toQa = stories.filter(
      (s) =>
        has(s, labels.tested) &&
        !has(s, labels.qaPassed) &&
        !has(s, labels.qaFailed),
    );
    for (const s of toQa) {
      try {
        await run.log("qa", "info", `QA "${s.summary}"`, s.key);
        const v = await qaReview(s);
        await addComment(s.key, `🔍 QA review (${v.pass ? "PASS" : "FAIL"}): ${v.summary}\n\n${v.details}`);
        if (v.pass) {
          await updateLabels(s.key, [labels.qaPassed, labels.done], [labels.qaFailed]);
          await maybeTransition(run, "qa", s.key, "qaPassed");
          run.count("qaPassed");
          await run.log("qa", "success", `Labeled ${labels.qaPassed} + ${labels.done}`, s.key);
        } else {
          await updateLabels(s.key, [labels.qaFailed], [labels.tested]);
          await maybeTransition(run, "qa", s.key, "qaFailed");
          await run.log("qa", "warn", `QA failed: ${v.summary}`, s.key);
        }
      } catch (e) {
        await run.log("qa", "error", String((e as Error).message), s.key);
      }
    }

    await run.log(
      "done",
      "success",
      `Done — revised ${toRevise.length}, implemented ${toImplement.length}, ` +
        `tested ${toTest.length}, qa ${toQa.length}`,
    );
    await run.finish("ok");
  } catch (e) {
    await run.log("done", "error", String((e as Error).message));
    await run.finish("error");
    throw e;
  }
}
