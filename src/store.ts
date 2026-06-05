import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = Resource.Runs.name;

export type Level = "info" | "success" | "warn" | "error";
export type Stage = "fetch" | "revise" | "execute" | "testing" | "qa" | "done";

export interface RunEvent {
  ts: string;
  level: Level;
  stage: Stage;
  message: string;
  issueKey?: string;
}

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

type Counter = "fetched" | "revised" | "implemented" | "tested" | "qaPassed" | "errors";

// --- Tenant-isolated key scheme -------------------------------------------------
// Every item is prefixed by tenant, so one tenant can never read another's runs
// via the dashboard's queries. (Defence-in-depth alongside per-tenant credentials.)
const runsPk = (tenantId: string) => `T#${tenantId}#RUN`;
const eventsPk = (tenantId: string, runId: string) => `T#${tenantId}#RUN#${runId}`;

/** A single agent run, scoped to one tenant. */
export class Run {
  readonly runId: string;
  private seq = 0;
  private summary: RunSummary;

  constructor(
    readonly tenantId: string,
    now: string,
  ) {
    this.runId = `${now}-${Math.floor(performance.now()).toString(36)}`;
    this.summary = {
      tenantId,
      runId: this.runId,
      startedAt: now,
      status: "running",
      fetched: 0,
      revised: 0,
      implemented: 0,
      tested: 0,
      qaPassed: 0,
      errors: 0,
    };
  }

  count(field: Counter, by = 1) {
    this.summary[field] += by;
  }

  async log(stage: Stage, level: Level, message: string, issueKey?: string): Promise<void> {
    const ts = new Date().toISOString();
    if (level === "error") this.summary.errors += 1;
    console.log(`[${this.tenantId}][${stage}/${level}]${issueKey ? ` ${issueKey}` : ""} ${message}`);
    await doc.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          pk: eventsPk(this.tenantId, this.runId),
          sk: `${ts}#${(this.seq++).toString().padStart(4, "0")}`,
          ts,
          level,
          stage,
          message,
          issueKey,
        },
      }),
    );
  }

  async finish(status: "ok" | "error"): Promise<void> {
    this.summary.status = status;
    this.summary.finishedAt = new Date().toISOString();
    await doc.send(
      new PutCommand({
        TableName: TABLE,
        Item: { pk: runsPk(this.tenantId), sk: this.runId, ...this.summary },
      }),
    );
  }
}

/**
 * Count one Fargate runner dispatch for a tenant/project in the given month.
 * Drives per-project Fargate cost attribution in the cost dashboard (no AWS
 * per-task cost tagging needed). Key: `USAGE#<tenantId>` / `<YYYY-MM>`.
 */
export async function recordRunnerUsage(tenantId: string, isoTime: string): Promise<void> {
  const month = isoTime.slice(0, 7);
  await doc.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { pk: `USAGE#${tenantId}`, sk: month },
      UpdateExpression: "ADD runnerRuns :one SET tenantId = :t",
      ExpressionAttributeValues: { ":one": 1, ":t": tenantId },
    }),
  );
}

/** Dashboard helper: most recent runs for one tenant (newest first). */
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

/** Dashboard helper: all events for one run of one tenant. */
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
