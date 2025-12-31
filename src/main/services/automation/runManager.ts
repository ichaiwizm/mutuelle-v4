import { GlobalFlowPool } from "@/main/flows/engine/pool/GlobalFlowPool";
import { NotFoundError } from "@/shared/errors";
import { AutomationBroadcaster } from "../automationBroadcaster";
import { logger } from "@/main/services/logger";
import * as Q from "./RunQueries";
import type { RunWithItems } from "./types";

export async function getRun(runId: string): Promise<RunWithItems | null> {
  return Q.getRun(runId);
}

export async function getRunOrThrow(runId: string): Promise<RunWithItems> {
  const run = await Q.getRun(runId);
  if (!run) throw new NotFoundError("Run", runId);
  return run;
}

export async function listRuns(options?: { limit?: number; offset?: number }) {
  return Q.listRuns(options);
}

export async function cancelRun(runId: string): Promise<{ cancelled: boolean }> {
  const run = await Q.getRun(runId);
  if (!run) throw new NotFoundError("Run", runId);
  if (run.status === "done" || run.status === "failed" || run.status === "cancelled") return { cancelled: false };
  const now = new Date();
  await GlobalFlowPool.getInstance().cancelRun(runId);
  await Q.updateRunStatus(runId, "cancelled");
  await Q.updateItemsStatus(runId, ["queued", "running"], "cancelled", now);
  AutomationBroadcaster.runCancelled(runId);
  return { cancelled: true };
}

export async function deleteRun(runId: string): Promise<{ deleted: boolean }> {
  const run = await Q.getRun(runId);
  if (!run) throw new NotFoundError("Run", runId);
  if (run.status === "running" || run.status === "queued") throw new Error("Cannot delete a running or queued run");
  await Q.deleteRunItems(runId);
  await Q.deleteRun(runId);
  return { deleted: true };
}

export async function cleanupOnShutdown(): Promise<void> {
  await GlobalFlowPool.getInstance().shutdown();
  const now = new Date();
  await Q.markRunsAsFailed(["running", "queued"]);
  await Q.markItemsAsCancelled(["running", "queued", "waiting_user"], now, "");
  logger.info("Cleaned up running/queued/waiting_user runs on shutdown", { service: "AUTOMATION" });
}

export async function cleanupOrphanedRuns(): Promise<void> {
  logger.info("Checking for orphaned runs...", { service: "AUTOMATION" });
  const orphanedIds = await Q.getOrphanedRunIds();
  if (orphanedIds.length === 0) {
    logger.debug("No orphaned runs found", { service: "AUTOMATION" });
    return;
  }
  logger.warn(`Found ${orphanedIds.length} orphaned run(s), marking as failed...`, { service: "AUTOMATION" });
  const now = new Date();
  await Q.markRunsAsFailed(["running", "queued"]);
  await Q.markItemsAsCancelled(["running", "queued"], now, "Run interrupted by app crash or restart");
  await Q.markWaitingUserAsFailed(now, "Session navigateur perdue (redemarrage de l'application)");
  logger.info("Orphaned runs cleanup complete", { service: "AUTOMATION" });
}
