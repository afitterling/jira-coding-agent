import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  CreateSecretCommand,
  DeleteSecretCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
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
  jql?: string;
  repoUrl?: string;
  createdAt: string;
}

export interface NewProject {
  name: string;
  jiraHost: string;
  jiraEmail: string;
  jiraToken: string;
  jql?: string;
  repoUrl?: string;
  githubToken?: string;
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
    jql: i.jql,
    repoUrl: i.repoUrl,
    createdAt: i.createdAt,
  }));
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
    jql: input.jql,
    repoUrl: input.repoUrl,
    createdAt,
  };
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
