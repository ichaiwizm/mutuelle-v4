import { useState, useEffect, useCallback, useRef } from "react";
import type {
  AutomationProgressEvent,
  StepProgress,
  StepProgressData,
} from "@/shared/types/step-progress";
import type { RunItem } from "@/shared/types/run";

export type LiveRunState = {
  runId: string;
  status: "running" | "completed" | "failed" | "cancelled";
  items: Map<string, LiveItemState>;
  itemCount: number;
  completedCount: number;
  failedCount: number;
  cancelledCount: number;
};

export type LiveItemState = {
  itemId: string;
  flowKey: string;
  leadId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  steps: StepProgress[];
  currentStepIndex: number;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  error?: string;
};

type UseFlowProgressOptions = {
  /** Only track events for this specific runId */
  runId?: string;
  /** Callback when a run starts */
  onRunStarted?: (runId: string, itemCount: number) => void;
  /** Callback when a run completes */
  onRunCompleted?: (runId: string, success: boolean) => void;
  /** Callback when an item completes */
  onItemCompleted?: (runId: string, itemId: string, success: boolean) => void;
};

/**
 * Hook to track live automation progress via IPC events
 */
export function useFlowProgress(options: UseFlowProgressOptions = {}) {
  const { runId: filterRunId, onRunStarted, onRunCompleted, onItemCompleted } = options;

  const [runs, setRuns] = useState<Map<string, LiveRunState>>(new Map());
  const [isListening, setIsListening] = useState(false);

  // Use refs for callbacks to avoid re-subscribing on every change
  const callbacksRef = useRef({ onRunStarted, onRunCompleted, onItemCompleted });
  callbacksRef.current = { onRunStarted, onRunCompleted, onItemCompleted };

  // Handle incoming events
  const handleEvent = useCallback(
    (event: AutomationProgressEvent) => {
      // Filter by runId if specified
      if (filterRunId && "runId" in event && event.runId !== filterRunId) {
        return;
      }

      setRuns((prev) => {
        const next = new Map(prev);

        // Helper to get or create run
        const getOrCreateRun = (runId: string): LiveRunState => {
          let run = next.get(runId);
          if (!run) {
            run = {
              runId,
              status: "running",
              items: new Map(),
              itemCount: 0,
              completedCount: 0,
              failedCount: 0,
              cancelledCount: 0,
            };
            next.set(runId, run);
          }
          return run;
        };

        switch (event.type) {
          case "run:started": {
            const run = getOrCreateRun(event.runId);
            run.itemCount = event.itemCount;
            callbacksRef.current.onRunStarted?.(event.runId, event.itemCount);
            break;
          }

          case "run:completed": {
            const run = next.get(event.runId);
            if (run) {
              run.status = event.success ? "completed" : "failed";
            }
            callbacksRef.current.onRunCompleted?.(event.runId, event.success);
            break;
          }

          case "item:started": {
            const run = getOrCreateRun(event.runId);
            run.items.set(event.itemId, {
              itemId: event.itemId,
              flowKey: event.flowKey,
              leadId: event.leadId,
              status: "running",
              steps: event.steps,
              currentStepIndex: 0,
              startedAt: Date.now(),
            });
            break;
          }

          case "item:step:started": {
            const run = next.get(event.runId);
            const item = run?.items.get(event.itemId);
            if (item && item.steps[event.stepIndex]) {
              item.steps[event.stepIndex].status = "running";
              item.steps[event.stepIndex].startedAt = Date.now();
              item.currentStepIndex = event.stepIndex;
            }
            break;
          }

          case "item:step:completed": {
            const run = next.get(event.runId);
            const item = run?.items.get(event.itemId);
            if (item && item.steps[event.stepIndex]) {
              item.steps[event.stepIndex].status = "completed";
              item.steps[event.stepIndex].completedAt = Date.now();
              item.steps[event.stepIndex].duration = event.duration;
              if (event.screenshot) {
                item.steps[event.stepIndex].screenshot = event.screenshot;
              }
            }
            break;
          }

          case "item:step:failed": {
            const run = next.get(event.runId);
            const item = run?.items.get(event.itemId);
            if (item && item.steps[event.stepIndex]) {
              item.steps[event.stepIndex].status = "failed";
              item.steps[event.stepIndex].completedAt = Date.now();
              item.steps[event.stepIndex].error = event.error;
              if (event.screenshot) {
                item.steps[event.stepIndex].screenshot = event.screenshot;
              }
            }
            break;
          }

          case "item:step:skipped": {
            const run = next.get(event.runId);
            const item = run?.items.get(event.itemId);
            if (item && item.steps[event.stepIndex]) {
              item.steps[event.stepIndex].status = "skipped";
            }
            break;
          }

          case "item:completed": {
            const run = next.get(event.runId);
            const item = run?.items.get(event.itemId);
            if (run && item) {
              item.status = event.success ? "completed" : "failed";
              item.completedAt = Date.now();
              item.duration = event.duration;

              if (event.success) {
                run.completedCount++;
              } else {
                run.failedCount++;
              }

              callbacksRef.current.onItemCompleted?.(event.runId, event.itemId, event.success);
            }
            break;
          }

          case "item:failed": {
            const run = next.get(event.runId);
            const item = run?.items.get(event.itemId);
            if (run && item) {
              item.status = "failed";
              item.error = event.error;
              item.completedAt = Date.now();
              run.failedCount++;

              callbacksRef.current.onItemCompleted?.(event.runId, event.itemId, false);
            }
            break;
          }

          case "run:cancelled": {
            const run = next.get(event.runId);
            if (run) {
              run.status = "cancelled";
              // Mark all running/queued items as cancelled
              for (const item of run.items.values()) {
                if (item.status === "running" || item.status === "queued") {
                  item.status = "cancelled";
                  item.completedAt = Date.now();
                  run.cancelledCount++;
                  // Mark running/pending steps as cancelled
                  for (const step of item.steps) {
                    if (step.status === "running" || step.status === "pending") {
                      step.status = "cancelled";
                    }
                  }
                }
              }
            }
            break;
          }

          case "item:cancelled": {
            const run = next.get(event.runId);
            const item = run?.items.get(event.itemId);
            if (run && item) {
              item.status = "cancelled";
              item.completedAt = Date.now();
              run.cancelledCount++;
              // Mark running/pending steps as cancelled
              for (const step of item.steps) {
                if (step.status === "running" || step.status === "pending") {
                  step.status = "cancelled";
                }
              }
            }
            break;
          }
        }

        return next;
      });
    },
    [filterRunId]
  );

  // Subscribe to events
  useEffect(() => {
    const unsubscribe = window.api.automation.onProgress(handleEvent);
    setIsListening(true);

    return () => {
      unsubscribe();
      setIsListening(false);
    };
  }, [handleEvent]);

  // Get a specific run's state
  const getRun = useCallback(
    (runId: string): LiveRunState | undefined => {
      return runs.get(runId);
    },
    [runs]
  );

  // Get all items for a run as an array
  const getRunItems = useCallback(
    (runId: string): LiveItemState[] => {
      const run = runs.get(runId);
      return run ? Array.from(run.items.values()) : [];
    },
    [runs]
  );

  // Clear a completed run from memory
  const clearRun = useCallback((runId: string) => {
    setRuns((prev) => {
      const next = new Map(prev);
      next.delete(runId);
      return next;
    });
  }, []);

  // Check if there are any active runs
  const hasActiveRuns = Array.from(runs.values()).some((r) => r.status === "running");

  return {
    runs,
    getRun,
    getRunItems,
    clearRun,
    isListening,
    hasActiveRuns,
    activeRunIds: Array.from(runs.entries())
      .filter(([, run]) => run.status === "running")
      .map(([id]) => id),
  };
}

/**
 * Hook to track a specific run's progress
 */
export function useRunProgress(runId: string | null) {
  const { getRun, getRunItems } = useFlowProgress({
    runId: runId ?? undefined,
  });

  const run = runId ? getRun(runId) : undefined;
  const items = runId ? getRunItems(runId) : [];

  // Calculate progress percentage
  const progress = run
    ? Math.round(((run.completedCount + run.failedCount) / run.itemCount) * 100)
    : 0;

  return {
    run,
    items,
    progress,
    isRunning: run?.status === "running",
    isCompleted: run?.status === "completed" || run?.status === "failed",
  };
}
