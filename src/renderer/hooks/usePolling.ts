import { useEffect, useRef, useCallback } from "react";

type UsePollingOptions = {
  /** Polling interval in milliseconds */
  interval: number;
  /** Whether polling is enabled */
  enabled?: boolean;
  /** Whether to fetch immediately on mount */
  immediate?: boolean;
};

/**
 * Hook for polling data at regular intervals
 */
export function usePolling(
  fetchFn: () => Promise<void>,
  options: UsePollingOptions
) {
  const { interval, enabled = true, immediate = true } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchRef = useRef(fetchFn);

  // Keep fetchFn ref updated
  fetchRef.current = fetchFn;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    intervalRef.current = setInterval(() => {
      fetchRef.current();
    }, interval);
  }, [interval, stop]);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    if (immediate) {
      fetchRef.current();
    }

    start();

    return stop;
  }, [enabled, immediate, start, stop]);

  return { start, stop };
}
