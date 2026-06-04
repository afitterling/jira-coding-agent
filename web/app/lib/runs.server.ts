import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = Resource.Runs.name;

export interface RunSummary {
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
