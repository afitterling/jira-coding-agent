import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";
import type { Story } from "./jira.js";

export interface Verdict {
  pass: boolean;
  summary: string;
  details: string;
}

/** An LLM client bound to one tenant's model (API key is shared / can be per-tenant). */
export function createLlm(model: string) {
  const client = new Anthropic({ apiKey: config.anthropic.apiKey });

  async function complete(system: string, user: string, maxTokens = 1500): Promise<string> {
    const msg = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });
    return msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
  }

  async function completeJson(system: string, user: string, maxTokens = 2000): Promise<Verdict> {
    const text = await complete(
      system + ' Respond with ONLY a JSON object: {"pass": boolean, "summary": string, "details": string}.',
      user,
      maxTokens,
    );
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { pass: false, summary: "Unparseable verdict", details: text };
    try {
      const obj = JSON.parse(match[0]) as Partial<Verdict>;
      return { pass: Boolean(obj.pass), summary: obj.summary ?? "", details: obj.details ?? "" };
    } catch {
      return { pass: false, summary: "Invalid JSON verdict", details: text };
    }
  }

  return {
    /** Step 1+2: read a story and produce a refined spec / acceptance criteria. */
    reviseStory(story: Story): Promise<string> {
      const system =
        "You are a senior product engineer. Rewrite the given Jira story into a crisp, " +
        "implementation-ready specification: a one-line goal, clear scope, and a numbered " +
        "list of testable acceptance criteria. Be concise. Output plain text only.";
      return complete(system, `Story ${story.key}: ${story.summary}\n\nCurrent description:\n${story.description || "(empty)"}`);
    },

    /** Step 3: produce the code work for a #ready story (inline mode). */
    implementStory(story: Story): Promise<string> {
      const system =
        "You are a senior software engineer. Given a ready specification, produce a concrete " +
        "implementation plan followed by the code (in fenced blocks with file paths). Keep it " +
        "self-contained and production-quality. Output plain text/markdown only.";
      return complete(system, `Story ${story.key}: ${story.summary}\n\nSpecification:\n${story.description || "(empty)"}`, 3000);
    },

    /** Testing sub-flow: derive test cases and judge whether the implementation passes. */
    testStory(story: Story): Promise<Verdict> {
      const system =
        "You are a senior test engineer. Derive the test cases that cover the story's acceptance " +
        "criteria, then judge whether the described implementation satisfies them. `pass` = all " +
        "critical cases satisfied. Put cases and gaps in `details`.";
      return completeJson(system, `Story ${story.key}: ${story.summary}\n\nSpec/implementation:\n${story.description || "(empty)"}`);
    },

    /** QA sub-flow: validate completeness, edge cases, regressions. */
    qaReview(story: Story): Promise<Verdict> {
      const system =
        "You are a meticulous QA reviewer. Validate the story against its acceptance criteria: " +
        "completeness, edge cases, likely regressions. `pass` = ready to ship. List findings in `details`.";
      return completeJson(system, `Story ${story.key}: ${story.summary}\n\nSpec:\n${story.description || "(empty)"}`);
    },
  };
}

export type Llm = ReturnType<typeof createLlm>;
