import type { FlowTask } from "../types";
import type { FlowExecutionResult } from "../../types";

/** Callback for when user manually closes the browser window */
export type OnManualCloseCallback = (taskId: string) => void;

/** Creates an aborted result for a task */
export function createAbortedResult(task: FlowTask): FlowExecutionResult {
  return {
    success: false,
    flowKey: task.flowKey,
    leadId: task.leadId,
    steps: [],
    totalDuration: 0,
    error: new Error("Flow aborted"),
    aborted: true,
  };
}
