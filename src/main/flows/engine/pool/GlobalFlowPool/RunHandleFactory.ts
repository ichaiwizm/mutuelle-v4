import type { FlowTask } from "../types";
import type { GlobalTask, TaskCallbacks, RunHandle } from "../types/global";

/**
 * Factory for creating RunHandle and GlobalTask objects.
 * Handles the creation of run handles with completion promises
 * and the conversion of FlowTasks to GlobalTasks.
 */
export class RunHandleFactory {
  /**
   * Create a new RunHandle for tracking a run's lifecycle.
   */
  createRunHandle(runId: string, tasks: FlowTask[]): RunHandle {
    let resolve: () => void;
    const completionPromise = new Promise<void>((r) => {
      resolve = r;
    });

    return {
      runId,
      taskIds: new Set(tasks.map((t) => t.id)),
      totalCount: tasks.length,
      completedCount: 0,
      abortController: new AbortController(),
      completionPromise,
      resolve: resolve!,
    };
  }

  /**
   * Convert FlowTasks to GlobalTasks with run association.
   */
  createGlobalTasks(
    tasks: FlowTask[],
    runId: string,
    callbacks: TaskCallbacks
  ): GlobalTask[] {
    return tasks.map((task) => ({
      ...task,
      runId,
      queuedAt: Date.now(),
      status: "queued" as const,
      callbacks,
    }));
  }
}
