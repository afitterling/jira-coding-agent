import { runAgent } from "./agent.js";

/** Cron entrypoint — fires every 2 minutes (see sst.config.ts). */
export async function handler(event: { time?: string }) {
  const now = event?.time ?? new Date().toISOString();
  await runAgent(now);
  return { ok: true, ranAt: now };
}
