import type { GlobalTask, RunHandle } from "../types/global";
import type { BrowserContext } from "playwright";
import type { FlowWorker } from "../workers/FlowWorker";
import type { TaskStateManager } from "../state/TaskStateManager";
import type { WorkerLifecycleManager } from "../state/WorkerLifecycleManager";
import { captureException } from "../../../../services/monitoring";

export type WorkerWithContext = {
  worker: FlowWorker;
  context: BrowserContext;
};

export async function createWorkerForTask(
  task: GlobalTask,
  lifecycleManager: WorkerLifecycleManager,
  stateManager: TaskStateManager,
  removeTaskFromQueue: (taskId: string) => void,
  onTaskComplete: () => void
): Promise<WorkerWithContext | null> {
  const isVisibleMode = task.automationSettings?.headless === false;
  try {
    return await lifecycleManager.createWorkerWithContext(task.id, isVisibleMode);
  } catch (error) {
    console.error(`[TASK_EXECUTOR] FAILED to create browser context:`, error);
    const err = error instanceof Error ? error : new Error(String(error));
    captureException(err, {
      tags: { flowKey: task.flowKey, context: "browser-context-creation" },
      extra: { taskId: task.id },
    });
    stateManager.removePending(task.id);
    task.status = "failed";
    await task.callbacks.onError(task.id, err);
    removeTaskFromQueue(task.id);
    onTaskComplete();
    return null;
  }
}

export async function abortWorkersForRun(
  taskIds: Set<string>,
  stateManager: TaskStateManager,
  lifecycleManager: WorkerLifecycleManager
): Promise<void> {
  const runningWorkers = stateManager.getActiveWorkersForRun(taskIds);
  if (runningWorkers.length > 0) {
    console.log(`[TASK_EXECUTOR] Aborting ${runningWorkers.length} running tasks`);
    await Promise.all(runningWorkers.map(([, worker]) => worker.abort().catch(() => {})));
  }
  const waitingWorkers = stateManager.getWaitingWorkersForRun(taskIds);
  if (waitingWorkers.length > 0) {
    console.log(`[TASK_EXECUTOR] Aborting ${waitingWorkers.length} waiting_user tasks`);
    await lifecycleManager.abortWaitingWorkers(waitingWorkers);
    waitingWorkers.forEach(([taskId]) => stateManager.removeWaitingUser(taskId));
  }
}

export async function cleanupAllWaitingWorkers(
  stateManager: TaskStateManager,
  lifecycleManager: WorkerLifecycleManager
): Promise<void> {
  const entries = stateManager.getAllWaitingUserEntries();
  console.log(`[TASK_EXECUTOR] Cleaning up ${entries.length} waiting_user workers`);
  await lifecycleManager.abortWaitingWorkers(entries);
  stateManager.clearWaitingUserWorkers();
}
