import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = Resource.Runs.name;

export interface RunSummary {
  tenantId: string;
  runId: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "ok" | "error";
  fetched: number;
  revised: number;
  implemented: number;
  tested: number;
  qaPassed: number;
  errors: number;
}

export interface RunEvent {
  ts: string;
  level: "info" | "success" | "warn" | "error";
  stage: "fetch" | "revise" | "execute" | "testing" | "qa" | "done";
  message: string;
  issueKey?: string;
}

// Tenant-isolated key scheme — mirrors src/store.ts.
const runsPk = (tenantId: string) => `T#${tenantId}#RUN`;
const eventsPk = (tenantId: string, runId: string) => `T#${tenantId}#RUN#${runId}`;

/** Tenant ids offered in the dashboard selector (from the TENANT_IDS env). */
export function tenants(): string[] {
  const raw = process.env.TENANT_IDS ?? "default";
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function recentRuns(tenantId: string, limit = 25): Promise<RunSummary[]> {
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": runsPk(tenantId) },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );
  return (res.Items ?? []) as RunSummary[];
}

export async function runEvents(tenantId: string, runId: string): Promise<RunEvent[]> {
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": eventsPk(tenantId, runId) },
      ScanIndexForward: true,
    }),
  );
  return (res.Items ?? []) as RunEvent[];
}
