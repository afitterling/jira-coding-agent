import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  type Group,
} from "@aws-sdk/client-cost-explorer";
import { listAllProjects } from "./projects.server";

// Cost Explorer is a global service but the endpoint lives in us-east-1.
const ce = new CostExplorerClient({ region: "us-east-1" });
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// SST tags every resource with `sst:app` + `sst:stage`. We scope all queries to
// THIS app so the dashboard only ever shows the cost of this exact project.
const APP = process.env.SST_APP_NAME ?? "jira-coding-agent";

export interface ServiceCost {
  service: string;
  amount: number;
}
export interface StageCost {
  stage: string;
  total: number;
  services: ServiceCost[];
}
export interface MonthTotal {
  month: string; // YYYY-MM
  amount: number;
  fargate: number; // ECS/Fargate portion of that month
}
export interface CostReport {
  app: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
  grandTotal: number;
  stages: StageCost[];
  months: MonthTotal[];
  /** False when the sst:* cost-allocation tags are not (yet) activated in Billing. */
  tagsActive: boolean;
  generatedAt: string;
}

/** Per-project estimated cost (admin sees all; owners see only theirs). */
export interface ProjectCost {
  projectId: string;
  name: string;
  ownerEmail: string;
  runnerRuns: number;
  runnerCost: number; // Fargate share, proportional to runner usage
  sharedCost: number; // equal split of shared (non-Fargate) infra
  total: number;
}
export interface ProjectCostReport {
  currency: string;
  periodStart: string;
  periodEnd: string;
  projects: ProjectCost[];
  /** Estimate — see allocation method. */
  estimated: true;
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const round = (n: number) => Math.round(n * 100) / 100;

/** Cost Explorer reports Fargate compute under ECS / "AWS Fargate". */
const isFargate = (service: string) =>
  /container service|fargate/i.test(service);

function stageOf(group: Group): string {
  const raw = group.Keys?.[0] ?? "";
  const val = raw.includes("$") ? raw.slice(raw.indexOf("$") + 1) : raw;
  return val || "(untagged)";
}

/**
 * Cost of this app across all stages, grouped by stage × AWS service (position),
 * for the trailing `months` calendar months (current month included, MTD).
 */
export async function getCostReport(months = 6): Promise<CostReport> {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));

  const res = await ce.send(
    new GetCostAndUsageCommand({
      TimePeriod: { Start: ymd(start), End: ymd(end) },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
      Filter: { Tags: { Key: "sst:app", Values: [APP], MatchOptions: ["EQUALS"] } },
      GroupBy: [
        { Type: "TAG", Key: "sst:stage" },
        { Type: "DIMENSION", Key: "SERVICE" },
      ],
    }),
  );

  const stageMap = new Map<string, Map<string, number>>();
  const months_: MonthTotal[] = [];
  let currency = "USD";
  let sawRealStage = false;

  for (const t of res.ResultsByTime ?? []) {
    const month = (t.TimePeriod?.Start ?? "").slice(0, 7);
    let monthSum = 0;
    let monthFargate = 0;
    for (const g of t.Groups ?? []) {
      const amount = Number(g.Metrics?.UnblendedCost?.Amount ?? "0");
      currency = g.Metrics?.UnblendedCost?.Unit ?? currency;
      monthSum += amount;
      const stage = stageOf(g);
      if (stage !== "(untagged)") sawRealStage = true;
      const service = g.Keys?.[1] ?? "Other";
      if (isFargate(service)) monthFargate += amount;
      const svcMap = stageMap.get(stage) ?? new Map<string, number>();
      svcMap.set(service, (svcMap.get(service) ?? 0) + amount);
      stageMap.set(stage, svcMap);
    }
    months_.push({ month, amount: round(monthSum), fargate: round(monthFargate) });
  }

  const stages: StageCost[] = [...stageMap.entries()]
    .map(([stage, svcMap]) => {
      const services = [...svcMap.entries()]
        .map(([service, amount]) => ({ service, amount: round(amount) }))
        .filter((s) => s.amount !== 0)
        .sort((a, b) => b.amount - a.amount);
      const total = round(services.reduce((sum, s) => sum + s.amount, 0));
      return { stage, total, services };
    })
    .filter((s) => s.total !== 0)
    .sort((a, b) => b.total - a.total);

  const grandTotal = round(stages.reduce((sum, s) => sum + s.total, 0));

  return {
    app: APP,
    currency,
    periodStart: ymd(start),
    periodEnd: ymd(end),
    grandTotal,
    stages,
    months: months_,
    tagsActive: sawRealStage || grandTotal === 0,
    generatedAt: new Date().toISOString(),
  };
}

/** Read a project's runner-dispatch count per month (USAGE#<projectId>). */
async function runnerUsage(projectId: string): Promise<Map<string, number>> {
  const res = await doc.send(
    new QueryCommand({
      TableName: Resource.Runs.name,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": `USAGE#${projectId}` },
    }),
  );
  const m = new Map<string, number>();
  for (const i of res.Items ?? []) m.set(i.sk as string, Number(i.runnerRuns ?? 0));
  return m;
}

/**
 * Estimated per-project cost. AWS cost isn't tagged per project, so:
 *  - Fargate/ECS cost each month is split proportional to runner-dispatch counts.
 *  - Shared (non-Fargate) cost each month is split equally across all projects.
 */
export async function getProjectCosts(report: CostReport): Promise<ProjectCostReport> {
  const projects = await listAllProjects();
  const usage = new Map<string, Map<string, number>>();
  await Promise.all(
    projects.map(async (p) => usage.set(p.projectId, await runnerUsage(p.projectId))),
  );

  const acc = new Map<string, ProjectCost>();
  for (const p of projects) {
    acc.set(p.projectId, {
      projectId: p.projectId,
      name: p.name,
      ownerEmail: p.ownerEmail,
      runnerRuns: 0,
      runnerCost: 0,
      sharedCost: 0,
      total: 0,
    });
  }

  const n = projects.length;
  for (const mo of report.months) {
    const shared = Math.max(0, mo.amount - mo.fargate);
    const sharedEach = n > 0 ? shared / n : 0;
    const totalRuns = projects.reduce((s, p) => s + (usage.get(p.projectId)?.get(mo.month) ?? 0), 0);
    for (const p of projects) {
      const runs = usage.get(p.projectId)?.get(mo.month) ?? 0;
      const fShare = totalRuns > 0 ? mo.fargate * (runs / totalRuns) : 0;
      const a = acc.get(p.projectId)!;
      a.runnerRuns += runs;
      a.runnerCost += fShare;
      a.sharedCost += sharedEach;
    }
  }

  const list = [...acc.values()].map((a) => ({
    ...a,
    runnerCost: round(a.runnerCost),
    sharedCost: round(a.sharedCost),
    total: round(a.runnerCost + a.sharedCost),
  }));
  list.sort((a, b) => b.total - a.total);

  return {
    currency: report.currency,
    periodStart: report.periodStart,
    periodEnd: report.periodEnd,
    projects: list,
    estimated: true,
  };
}
