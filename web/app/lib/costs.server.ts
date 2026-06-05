import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  type Group,
} from "@aws-sdk/client-cost-explorer";

// Cost Explorer is a global service but the endpoint lives in us-east-1.
const ce = new CostExplorerClient({ region: "us-east-1" });

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

const ymd = (d: Date) => d.toISOString().slice(0, 10);

/** Parse a Cost Explorer TAG group key ("sst:stage$dev") into its value ("dev"). */
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
  // CE End is exclusive → first day of NEXT month.
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

  const stageMap = new Map<string, Map<string, number>>(); // stage -> service -> amount
  const monthTotals: MonthTotal[] = [];
  let currency = "USD";
  let sawRealStage = false;

  for (const t of res.ResultsByTime ?? []) {
    const month = (t.TimePeriod?.Start ?? "").slice(0, 7);
    let monthSum = 0;
    for (const g of t.Groups ?? []) {
      const amount = Number(g.Metrics?.UnblendedCost?.Amount ?? "0");
      currency = g.Metrics?.UnblendedCost?.Unit ?? currency;
      monthSum += amount;
      const stage = stageOf(g);
      if (stage !== "(untagged)") sawRealStage = true;
      const service = g.Keys?.[1] ?? "Other";
      const svcMap = stageMap.get(stage) ?? new Map<string, number>();
      svcMap.set(service, (svcMap.get(service) ?? 0) + amount);
      stageMap.set(stage, svcMap);
    }
    monthTotals.push({ month, amount: round(monthSum) });
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
    months: monthTotals,
    tagsActive: sawRealStage || grandTotal === 0,
    generatedAt: new Date().toISOString(),
  };
}

const round = (n: number) => Math.round(n * 100) / 100;
