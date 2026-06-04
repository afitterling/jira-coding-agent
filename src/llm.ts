import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";
import type { Story } from "./jira.js";

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

async function complete(system: string, user: string, maxTokens = 1500): Promise<string> {
  const msg = await client.messages.create({
    model: config.anthropic.model,
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

/** Step 1+2: read a story and produce a refined spec / acceptance criteria. */
export function reviseStory(story: Story): Promise<string> {
  const system =
    "You are a senior product engineer. Rewrite the given Jira story into a crisp, " +
    "implementation-ready specification: a one-line goal, clear scope, and a numbered " +
    "list of testable acceptance criteria. Be concise. Output plain text only.";
  const user = `Story ${story.key}: ${story.summary}\n\nCurrent description:\n${story.description || "(empty)"}`;
  return complete(system, user);
}

/** Step 3: produce the code work for a #ready story. */
export function implementStory(story: Story): Promise<string> {
  const system =
    "You are a senior software engineer. Given a ready specification, produce a concrete " +
    "implementation plan followed by the code (in fenced blocks with file paths). Keep it " +
    "self-contained and production-quality. Output plain text/markdown only.";
  const user = `Story ${story.key}: ${story.summary}\n\nSpecification:\n${story.description || "(empty)"}`;
  return complete(system, user, 3000);
}

export interface Verdict {
  pass: boolean;
  summary: string;
  details: string;
}

/** Parse the first JSON object out of a model response. */
async function completeJson(system: string, user: string, maxTokens = 2000): Promise<Verdict> {
  const text = await complete(
    system + " Respond with ONLY a JSON object: " +
      '{"pass": boolean, "summary": string, "details": string}.',
    user,
    maxTokens,
  );
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { pass: false, summary: "Unparseable verdict", details: text };
  try {
    const obj = JSON.parse(match[0]) as Partial<Verdict>;
    return {
      pass: Boolean(obj.pass),
      summary: obj.summary ?? "",
      details: obj.details ?? "",
    };
  } catch {
    return { pass: false, summary: "Invalid JSON verdict", details: text };
  }
}

/**
 * Testing sub-flow: author tests for the implemented story and judge whether the
 * implementation would pass them. (Real execution is delegated to CI / Vercel
 * Sandbox — see TODO.md; this gate is the spec-level test review.)
 */
export function testStory(story: Story): Promise<Verdict> {
  const system =
    "You are a senior test engineer. Given a story and its implementation notes, derive the " +
    "test cases that cover its acceptance criteria, then judge whether the described " +
    "implementation satisfies them. `pass` = all critical cases satisfied. Put the test cases " +
    "and any gaps in `details`.";
  const user = `Story ${story.key}: ${story.summary}\n\nSpec/implementation:\n${story.description || "(empty)"}`;
  return completeJson(system, user);
}

/**
 * QA sub-flow: validate the tested story against its acceptance criteria from a
 * product/UX standpoint — completeness, edge cases, regressions.
 */
export function qaReview(story: Story): Promise<Verdict> {
  const system =
    "You are a meticulous QA reviewer. Validate the story against its acceptance criteria: " +
    "completeness, edge cases, and likely regressions. `pass` = ready to ship. List concrete " +
    "findings in `details`.";
  const user = `Story ${story.key}: ${story.summary}\n\nSpec:\n${story.description || "(empty)"}`;
  return completeJson(system, user);
}
