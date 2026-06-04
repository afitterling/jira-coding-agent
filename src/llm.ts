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
