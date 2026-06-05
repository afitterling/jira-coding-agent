/**
 * Project-backed tenants: user-managed projects live in the `Projects` DynamoDB
 * table; their Jira/GitHub credentials live in AWS Secrets Manager (one secret
 * per project). The cron resolves each project into a Tenant at run time, so
 * secrets are never stored in env, the run log, or DynamoDB.
 */
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { defaultJql, normHost, type Tenant } from "./config.js";

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sm = new SecretsManagerClient({});

export interface ProjectItem {
  pk: string;
  sk: string;
  projectId: string;
  ownerEmail: string;
  name: string;
  jiraHost: string;
  jiraEmail: string;
  jql?: string;
  model?: string;
  repoUrl?: string;
  secretArn: string;
  createdAt: string;
}

/** Load every stored project as a fully-resolved Tenant (credentials from Secrets Manager). */
export async function loadProjectTenants(): Promise<Tenant[]> {
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
  const res = await doc.send(new ScanCommand({ TableName: Resource.Projects.name }));
  const items = (res.Items ?? []) as ProjectItem[];

  const tenants: Tenant[] = [];
  for (const p of items) {
    if (!p.secretArn || !p.jiraHost) continue;
    let jiraToken = "";
    let githubToken = "";
    try {
      const sec = await sm.send(new GetSecretValueCommand({ SecretId: p.secretArn }));
      const creds = JSON.parse(sec.SecretString ?? "{}") as {
        jiraToken?: string;
        githubToken?: string;
      };
      jiraToken = creds.jiraToken ?? "";
      githubToken = creds.githubToken ?? "";
    } catch (e) {
      // Skip a project whose secret we can't read; never block other tenants.
      console.error(`[projects] secret fetch failed for ${p.projectId}: ${(e as Error).message}`);
      continue;
    }
    if (!jiraToken) continue;

    tenants.push({
      id: p.projectId,
      jira: { host: normHost(p.jiraHost), email: p.jiraEmail, token: jiraToken },
      jql: p.jql || defaultJql(),
      model: p.model || model,
      targetRepo: p.repoUrl || undefined,
      githubToken: githubToken || undefined,
    });
  }
  return tenants;
}
