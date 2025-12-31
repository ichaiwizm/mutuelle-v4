import type { FlowTask } from "@/main/flows/engine";
import type { TaskCallbacks } from "@/main/flows/engine/pool/types/global";
import { onStart, onComplete, onError, onWaitingUser, onManualComplete } from "./callbacks";

/**
 * Create TaskCallbacks for the global pool.
 */
export function createTaskCallbacks(runId: string, tasks: FlowTask[]): TaskCallbacks {
  return {
    onStart: (taskId) => onStart(runId, tasks, taskId),
    onComplete: (taskId, result) => onComplete(runId, taskId, result),
    onError: (taskId, error) => onError(runId, taskId, error),
    onWaitingUser: (taskId, result) => onWaitingUser(runId, taskId, result),
    onManualComplete: (taskId) => onManualComplete(runId, taskId),
  };
}
