import { useEffect, useCallback } from "react";
import { useFlowStatesStore } from "../stores";

/**
 * Hook for paused flow states management
 */
export function useFlowStates() {
  const store = useFlowStatesStore();

  // Initial fetch
  useEffect(() => {
    if (store.pausedFlows.length === 0 && store.loading === "idle") {
      store.fetchPaused();
    }
  }, [store]);

  const resume = useCallback(
    async (id: string) => {
      return store.resume(id);
    },
    [store]
  );

  const remove = useCallback(
    async (id: string) => {
      return store.remove(id);
    },
    [store]
  );

  return {
    pausedFlows: store.pausedFlows,
    pausedCount: store.pausedFlows.length,
    loading: store.loading,
    error: store.error,
    isLoading: store.loading === "loading",
    resuming: store.resuming,
    fetch: store.fetchPaused,
    resume,
    remove,
  };
}
