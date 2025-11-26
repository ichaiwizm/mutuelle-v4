import { useEffect, useCallback } from "react";
import { useRunsStore } from "../stores";
import { usePolling } from "./usePolling";
import type { AutomationEnqueueItem } from "@/shared/ipc/contracts";

const ACTIVE_POLLING_INTERVAL = 3_000; // 3 seconds when runs are active

/**
 * Hook for runs management with optional polling for active runs
 */
export function useRuns(options: { pollingEnabled?: boolean } = {}) {
  const { pollingEnabled = false } = options;
  const store = useRunsStore();

  // Check if there are active runs
  const hasActiveRuns = store.runs.some(
    (run) => run.status === "queued" || run.status === "running"
  );

  // Initial fetch
  useEffect(() => {
    if (store.runs.length === 0 && store.loading === "idle") {
      store.fetch();
    }
  }, [store]);

  // Poll when there are active runs
  usePolling(store.fetch, {
    interval: ACTIVE_POLLING_INTERVAL,
    enabled: pollingEnabled && hasActiveRuns,
    immediate: false,
  });

  const enqueue = useCallback(
    async (items: AutomationEnqueueItem[]) => {
      return store.enqueue(items);
    },
    [store]
  );

  const cancel = useCallback(
    async (runId: string) => {
      return store.cancel(runId);
    },
    [store]
  );

  return {
    runs: store.runs,
    total: store.total,
    currentRun: store.currentRun,
    currentPage: store.currentPage,
    pageSize: store.pageSize,
    totalPages: Math.ceil(store.total / store.pageSize),
    loading: store.loading,
    error: store.error,
    isLoading: store.loading === "loading",
    hasActiveRuns,
    fetch: store.fetch,
    fetchOne: store.fetchOne,
    setPage: store.setPage,
    enqueue,
    cancel,
  };
}
