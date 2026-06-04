import { config, labels } from "./config.js";
import { searchStories, updateLabels, addComment, type Story } from "./jira.js";
import { reviseStory, implementStory } from "./llm.js";
import { Run } from "./store.js";

const has = (s: Story, label: string) => s.labels.includes(label);

/**
 * One pass of the pipeline:
 *  1. read stories with #revise AND #undone   -> revise via prompt
 *  2. add #revised / remove #undone when done
 *  3. execute code work for #ready stories
 *  4. add #implemented when done
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
        run.count("implemented");
        await run.log("execute", "success", `Labeled ${labels.implemented}`, s.key);
      } catch (e) {
        await run.log("execute", "error", String((e as Error).message), s.key);
      }
    }

    await run.log(
      "done",
      "success",
      `Done — revised ${toRevise.length}, implemented ${toImplement.length}`,
    );
    await run.finish("ok");
  } catch (e) {
    await run.log("done", "error", String((e as Error).message));
    await run.finish("error");
    throw e;
  }
}
