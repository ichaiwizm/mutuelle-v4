import type { FlowResult } from "@mutuelle/engine";
import type { FlowExecutionResult } from "../../flows/engine";

/**
 * Convert FlowResult from YamlFlowEngine to FlowExecutionResult
 */
export function convertFlowResult(
  flowResult: FlowResult | null,
  flowKey: string,
  leadId: string | null
): FlowExecutionResult {
  if (!flowResult) {
    return {
      success: false,
      flowKey,
      leadId: leadId ?? undefined,
      steps: [],
      totalDuration: 0,
      error: new Error("Flow state not found or expired"),
    };
  }

  const success = flowResult.status === "completed";
  return {
    success,
    flowKey,
    leadId: leadId ?? undefined,
    steps: flowResult.stepResults.map((sr) => ({
      success: sr.status === "completed",
      stepId: sr.stepId,
      duration: sr.durationMs ?? 0,
      retries: sr.retryCount ?? 0,
      error: sr.error,
    })),
    totalDuration: flowResult.durationMs,
    error: flowResult.error ? new Error(flowResult.error.message) : undefined,
    paused: flowResult.status === "pending",
    stateId: flowResult.executionId,
  };
}

/** Extract platform name from flow key for credentials lookup */
export function getPlatformFromFlowKey(flowKey: string): string | undefined {
  if (flowKey.startsWith("alptis_")) return "alptis";
  if (flowKey.startsWith("swisslife_")) return "swisslife";
  if (flowKey.startsWith("entoria_")) return "entoria";
  return undefined;
}
