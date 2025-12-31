/**
 * Flow Execution Helpers
 */
import type { FlowDefinition, FlowResult } from "@mutuelle/engine";
import { emitLog } from "./log-handlers";

/**
 * Extract platform from flowKey
 */
export function extractPlatform(flowKey: string): string {
  if (flowKey.startsWith("alptis")) return "alptis";
  if (flowKey.startsWith("swisslife")) return "swisslife";
  if (flowKey.startsWith("entoria")) return "entoria";
  const parts = flowKey.split("_");
  if (parts.length > 0) return parts[0];
  return flowKey;
}

/**
 * Log flow steps as queued
 */
export function logQueuedSteps(flowDef: FlowDefinition): void {
  for (const step of flowDef.steps) {
    emitLog({
      timestamp: new Date().toISOString(),
      level: "debug",
      message: `Step queued: ${step.name}`,
      stepId: step.id,
    });
  }
}

/**
 * Emit logs for step results
 */
export function emitStepResults(flowDef: FlowDefinition, result: FlowResult): void {
  if (!result.stepResults) return;

  for (const stepResult of result.stepResults) {
    const stepDef = flowDef.steps.find((s) => s.id === stepResult.stepId);
    const stepName = stepDef?.name || stepResult.stepId;
    const durationStr = stepResult.durationMs ? ` (${stepResult.durationMs}ms)` : "";

    if (stepResult.status === "completed") {
      emitLog({
        timestamp: new Date().toISOString(),
        level: "info",
        message: `Step completed: ${stepName}${durationStr}`,
        stepId: stepResult.stepId,
      });
    } else if (stepResult.status === "failed") {
      const errorMsg = stepResult.error?.message || "Unknown error";
      emitLog({
        timestamp: new Date().toISOString(),
        level: "error",
        message: `Step failed: ${stepName} - ${errorMsg}`,
        stepId: stepResult.stepId,
      });
    } else {
      // Other statuses (pending, running, cancelled)
      emitLog({
        timestamp: new Date().toISOString(),
        level: "debug",
        message: `Step ${stepResult.status}: ${stepName}`,
        stepId: stepResult.stepId,
      });
    }
  }
}

/**
 * Emit logs from execution result
 */
export function emitResultLogs(result: FlowResult): void {
  if (!result.logs) return;

  for (const log of result.logs) {
    emitLog({
      timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : new Date().toISOString(),
      level: log.level,
      message: log.message,
      stepId: log.stepId,
    });
  }
}
