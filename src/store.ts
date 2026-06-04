import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = Resource.Runs.name;

export type Level = "info" | "success" | "warn" | "error";
export type Stage = "fetch" | "revise" | "execute" | "done";

export interface RunEvent {
  ts: string;
  level: Level;
  stage: Stage;
  message: string;
  issueKey?: string;
}

export interface RunSummary {
  runId: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "ok" | "error";
  fetched: number;
  revised: number;
  implemented: number;
  errors: number;
}

/** A single agent run. Owns event logging + final summary, both persisted to DynamoDB. */
export class Run {
  readonly runId: string;
  private seq = 0;
  private summary: RunSummary;

  constructor(now: string) {
    // runId sorts lexicographically by time; seq disambiguates same-ms runs.
    this.runId = `${now}-${Math.floor(performance.now()).toString(36)}`;
    this.summary = {
      runId: this.runId,
      startedAt: now,
      status: "running",
      fetched: 0,
      revised: 0,
      implemented: 0,
      errors: 0,
    };
  }

  count(field: "fetched" | "revised" | "implemented" | "errors", by = 1) {
    this.summary[field] += by;
  }

  async log(
    stage: Stage,
    level: Level,
    message: string,
    issueKey?: string,
  ): Promise<void> {
    const ts = new Date().toISOString();
    if (level === "error") this.summary.errors += 1;
    // Mirror to CloudWatch as well as the dashboard table.
    console.log(`[${stage}/${level}]${issueKey ? ` ${issueKey}` : ""} ${message}`);
    await doc.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          pk: `RUN#${this.runId}`,
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
        // pk constant so the dashboard can list recent runs in one query.
        Item: { pk: "RUN", sk: this.runId, ...this.summary },
      }),
    );
  }
}

/** Dashboard helper: list the most recent runs (newest first). */
export async function recentRuns(limit = 25): Promise<RunSummary[]> {
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": "RUN" },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );
  return (res.Items ?? []) as RunSummary[];
}

/** Dashboard helper: fetch all events for one run (chronological). */
export async function runEvents(runId: string): Promise<RunEvent[]> {
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": `RUN#${runId}` },
      ScanIndexForward: true,
    }),
  );
  return (res.Items ?? []) as RunEvent[];
}
