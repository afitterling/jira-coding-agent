import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  CreateSecretCommand,
  DeleteSecretCommand,
  GetSecretValueCommand,
  PutSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

// removeUndefinedValues lets us drop optional fields (jql/repoUrl) by setting
// them to undefined instead of hand-pruning the item on every write.
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const sm = new SecretsManagerClient({});
const TABLE = Resource.Projects.name;
// `${app}/${stage}/project` — keeps dev/prod secrets in separate namespaces.
const SECRET_PREFIX = process.env.SECRET_PREFIX ?? "jira-coding-agent/project";

/** Public project shape (never includes credentials). */
export interface Project {
  projectId: string;
  name: string;
  jiraHost: string;
  jiraEmail: string;
  /** Selected Jira project key (e.g. "FIN") to scope the agent to. */
  jiraProject?: string;
  jql?: string;
  repoUrl?: string;
  createdAt: string;
}

export interface NewProject {
  name: string;
  jiraHost: string;
  jiraEmail: string;
  jiraToken: string;
  jiraProject?: string;
  jql?: string;
  repoUrl?: string;
  githubToken?: string;
}

/** Edit shape: metadata is always sent; tokens are optional — a blank token
 *  keeps the stored credential, a non-empty one rotates it. */
export interface ProjectEdit {
  name: string;
  jiraHost: string;
  jiraEmail: string;
  jiraProject?: string;
  jql?: string;
  repoUrl?: string;
  jiraToken?: string;
  githubToken?: string;
}

/** One option in the Jira project picker. */
export interface JiraProjectOption {
  key: string;
  name: string;
}

const pk = (email: string) => `U#${email}`;
const sk = (projectId: string) => `PROJECT#${projectId}`;
const normHost = (h: string) => h.replace(/^https?:\/\//, "").replace(/\/$/, "");
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "project";

export async function listProjects(email: string): Promise<Project[]> {
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :p)",
      ExpressionAttributeValues: { ":pk": pk(email), ":p": "PROJECT#" },
    }),
  );
  return (res.Items ?? []).map((i) => ({
    projectId: i.projectId,
    name: i.name,
    jiraHost: i.jiraHost,
    jiraEmail: i.jiraEmail,
    jiraProject: i.jiraProject,
    jql: i.jql,
    repoUrl: i.repoUrl,
    createdAt: i.createdAt,
  }));
}

/** Every project across all owners (admin view + cost attribution). */
export async function listAllProjects(): Promise<{ projectId: string; name: string; ownerEmail: string }[]> {
  const res = await doc.send(new ScanCommand({ TableName: TABLE }));
  return (res.Items ?? [])
    .filter((i) => i.projectId)
    .map((i) => ({ projectId: i.projectId, name: i.name, ownerEmail: i.ownerEmail }));
}

export async function createProject(email: string, input: NewProject): Promise<Project> {
  const projectId = `${slug(input.name)}-${crypto.randomUUID().slice(0, 8)}`;
  const secretName = `${SECRET_PREFIX}/${email}/${projectId}`;

  // 1) Credentials → Secrets Manager (never stored in DynamoDB).
  const secret = await sm.send(
    new CreateSecretCommand({
      Name: secretName,
      SecretString: JSON.stringify({
        jiraToken: input.jiraToken,
        githubToken: input.githubToken ?? "",
      }),
    }),
  );

  const createdAt = new Date().toISOString();
  // 2) Project metadata + the secret ARN → DynamoDB.
  await doc.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        pk: pk(email),
        sk: sk(projectId),
        projectId,
        ownerEmail: email,
        name: input.name,
        jiraHost: normHost(input.jiraHost),
        jiraEmail: input.jiraEmail,
        jiraProject: input.jiraProject || undefined,
        jql: input.jql || undefined,
        repoUrl: input.repoUrl || undefined,
        secretArn: secret.ARN,
        createdAt,
      },
    }),
  );

  return {
    projectId,
    name: input.name,
    jiraHost: normHost(input.jiraHost),
    jiraEmail: input.jiraEmail,
    jiraProject: input.jiraProject || undefined,
    jql: input.jql,
    repoUrl: input.repoUrl,
    createdAt,
  };
}

export async function updateProject(
  email: string,
  projectId: string,
  input: ProjectEdit,
): Promise<Project> {
  const key = { pk: pk(email), sk: sk(projectId) };
  const got = await doc.send(new GetCommand({ TableName: TABLE, Key: key }));
  if (!got.Item) throw new Error("Project not found.");
  const existing = got.Item;

  // Rotate the secret only when a new token was entered; preserve the other one
  // by reading the current value first (web role has GetSecretValue).
  const rotateJira = Boolean(input.jiraToken?.length);
  const rotateGithub = Boolean(input.githubToken?.length);
  if ((rotateJira || rotateGithub) && existing.secretArn) {
    let current: { jiraToken?: string; githubToken?: string } = {};
    try {
      const sv = await sm.send(new GetSecretValueCommand({ SecretId: existing.secretArn as string }));
      if (sv.SecretString) current = JSON.parse(sv.SecretString);
    } catch (e) {
      console.error("secret read failed; keeping only entered values", (e as Error).message);
    }
    await sm.send(
      new PutSecretValueCommand({
        SecretId: existing.secretArn as string,
        SecretString: JSON.stringify({
          jiraToken: rotateJira ? input.jiraToken : current.jiraToken ?? "",
          githubToken: rotateGithub ? input.githubToken : current.githubToken ?? "",
        }),
      }),
    );
  }

  const jiraHost = normHost(input.jiraHost);
  // Preserve pk/sk/projectId/ownerEmail/secretArn/createdAt; overwrite metadata.
  await doc.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        ...existing,
        name: input.name,
        jiraHost,
        jiraEmail: input.jiraEmail,
        jiraProject: input.jiraProject || undefined,
        jql: input.jql || undefined,
        repoUrl: input.repoUrl || undefined,
      },
    }),
  );

  return {
    projectId,
    name: input.name,
    jiraHost,
    jiraEmail: input.jiraEmail,
    jiraProject: input.jiraProject || undefined,
    jql: input.jql || undefined,
    repoUrl: input.repoUrl || undefined,
    createdAt: existing.createdAt as string,
  };
}

/** List the connected Jira's projects for the picker, using the project's stored creds. */
export async function listJiraProjects(email: string, projectId: string): Promise<JiraProjectOption[]> {
  const got = await doc.send(new GetCommand({ TableName: TABLE, Key: { pk: pk(email), sk: sk(projectId) } }));
  const item = got.Item;
  if (!item?.secretArn || !item.jiraHost) return [];

  const sv = await sm.send(new GetSecretValueCommand({ SecretId: item.secretArn as string }));
  const { jiraToken } = JSON.parse(sv.SecretString ?? "{}") as { jiraToken?: string };
  if (!jiraToken) return [];

  const host = normHost(item.jiraHost as string);
  const auth = Buffer.from(`${item.jiraEmail}:${jiraToken}`).toString("base64");
  const out: JiraProjectOption[] = [];
  // /project/search is paginated — pull a few pages, capped to stay snappy.
  for (let startAt = 0, page = 0; page < 10; page++) {
    const res = await fetch(
      `https://${host}/rest/api/3/project/search?maxResults=50&startAt=${startAt}&orderBy=key`,
      { headers: { Authorization: `Basic ${auth}`, Accept: "application/json" } },
    );
    if (!res.ok) throw new Error(`Jira project list failed (${res.status})`);
    const data = (await res.json()) as { values?: { key: string; name: string }[]; isLast?: boolean };
    for (const v of data.values ?? []) out.push({ key: v.key, name: v.name });
    if (data.isLast || !data.values?.length) break;
    startAt += data.values.length;
  }
  return out;
}

/** Read a stored project's Jira token (used when testing an edit without re-entering it). */
export async function getProjectJiraToken(email: string, projectId: string): Promise<string> {
  const got = await doc.send(new GetCommand({ TableName: TABLE, Key: { pk: pk(email), sk: sk(projectId) } }));
  if (!got.Item?.secretArn) return "";
  const sv = await sm.send(new GetSecretValueCommand({ SecretId: got.Item.secretArn as string }));
  const { jiraToken } = JSON.parse(sv.SecretString ?? "{}") as { jiraToken?: string };
  return jiraToken ?? "";
}

/** Verify Jira credentials by calling /myself; throws with a friendly message on failure. */
export async function verifyJira(host: string, jiraEmail: string, token: string): Promise<{ displayName: string }> {
  const auth = Buffer.from(`${jiraEmail}:${token}`).toString("base64");
  const res = await fetch(`https://${normHost(host)}/rest/api/3/myself`, {
    headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
  });
  if (res.status === 401 || res.status === 403) throw new Error("Jira rejected those credentials (401/403).");
  if (!res.ok) throw new Error(`Jira responded ${res.status}.`);
  const me = (await res.json()) as { displayName?: string };
  return { displayName: me.displayName ?? jiraEmail };
}

export async function deleteProject(email: string, projectId: string): Promise<void> {
  const got = await doc.send(
    new GetCommand({ TableName: TABLE, Key: { pk: pk(email), sk: sk(projectId) } }),
  );
  const secretArn = got.Item?.secretArn as string | undefined;
  await doc.send(new DeleteCommand({ TableName: TABLE, Key: { pk: pk(email), sk: sk(projectId) } }));
  if (secretArn) {
    await sm
      .send(new DeleteSecretCommand({ SecretId: secretArn, ForceDeleteWithoutRecovery: true }))
      .catch((e) => console.error("secret delete failed", (e as Error).message));
  }
}
