import { useEffect } from "react";
import { useDashboardStore } from "../stores";
import { usePolling } from "./usePolling";

const POLLING_INTERVAL = 10_000; // 10 seconds

type UseDashboardOptions = {
  /** Enable auto-polling */
  polling?: boolean;
};

/**
 * Hook for accessing dashboard data with optional polling
 */
export function useDashboard(options: UseDashboardOptions = {}) {
  const { polling = false } = options;
  const { overview, loading, error, fetch } = useDashboardStore();

  // Initial fetch on mount
  useEffect(() => {
    if (!overview) {
      fetch();
    }
  }, [overview, fetch]);

  // Optional polling
  usePolling(fetch, {
    interval: POLLING_INTERVAL,
    enabled: polling,
    immediate: false,
  });

  return {
    overview,
    loading,
    error,
    refresh: fetch,
    isLoading: loading === "loading",
    hasError: loading === "error",
  };
}
