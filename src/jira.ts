import { config } from "./config.js";

export interface Story {
  key: string;
  id: string;
  summary: string;
  description: string;
  labels: string[];
  status: string;
}

const base = () => `https://${config.jira.host}/rest/api/3`;

function authHeader(): string {
  // Jira Cloud: Basic auth with email:apiToken.
  const raw = `${config.jira.email}:${config.jira.token}`;
  return "Basic " + Buffer.from(raw).toString("base64");
}

async function call(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Jira ${init?.method ?? "GET"} ${path} -> ${res.status} ${body}`);
  }
  return res;
}

/** Flatten an Atlassian Document Format (ADF) node tree to plain text. */
function adfToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { type?: string; text?: string; content?: unknown[] };
  if (n.type === "text" && typeof n.text === "string") return n.text;
  const inner = Array.isArray(n.content) ? n.content.map(adfToText).join("") : "";
  return n.type === "paragraph" || n.type === "heading" ? inner + "\n" : inner;
}

/** Wrap plain text (newline-separated) into a minimal ADF document. */
function textToAdf(text: string) {
  return {
    type: "doc",
    version: 1,
    content: text.split("\n").map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    })),
  };
}

/** Search the board via JQL using the current bulk endpoint. */
export async function searchStories(jql: string, maxResults = 50): Promise<Story[]> {
  const res = await call(`/search/jql`, {
    method: "POST",
    body: JSON.stringify({
      jql,
      maxResults,
      fields: ["summary", "description", "labels", "status"],
    }),
  });
  const data = (await res.json()) as { issues?: any[] };
  return (data.issues ?? []).map((i) => ({
    key: i.key,
    id: i.id,
    summary: i.fields?.summary ?? "",
    description: adfToText(i.fields?.description).trim(),
    labels: (i.fields?.labels ?? []) as string[],
    status: i.fields?.status?.name ?? "",
  }));
}

/** Atomically add/remove labels on an issue. */
export async function updateLabels(
  key: string,
  add: string[] = [],
  remove: string[] = [],
): Promise<void> {
  const update = {
    labels: [
      ...add.map((name) => ({ add: name })),
      ...remove.map((name) => ({ remove: name })),
    ],
  };
  await call(`/issue/${key}`, { method: "PUT", body: JSON.stringify({ update }) });
}

/** Post a comment (used to "notify" the revised spec / generated implementation). */
export async function addComment(key: string, text: string): Promise<void> {
  await call(`/issue/${key}/comment`, {
    method: "POST",
    body: JSON.stringify({ body: textToAdf(text) }),
  });
}
