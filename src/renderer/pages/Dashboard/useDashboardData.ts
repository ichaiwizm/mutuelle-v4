import { useEffect } from "react";
import { useDashboardStore, useMailStore } from "@/renderer/stores";
import { usePolling } from "@/renderer/hooks";

const POLLING_INTERVAL = 10_000;

/**
 * Hook that manages all dashboard data fetching
 */
export function useDashboardData() {
  const dashboard = useDashboardStore();
  const mail = useMailStore();

  // Initial fetch
  useEffect(() => {
    dashboard.fetch();
    mail.checkStatus();
  }, []);

  // Polling for dashboard refresh
  usePolling(dashboard.fetch, {
    interval: POLLING_INTERVAL,
    enabled: true,
    immediate: false,
  });

  return {
    overview: dashboard.overview,
    loading: dashboard.loading === "loading",
    error: dashboard.error,
    refresh: dashboard.fetch,
    mail: {
      isConnected: mail.status?.ok ?? false,
      email: mail.status?.email,
      connecting: mail.connecting,
      fetching: mail.fetching,
      connect: mail.connect,
      disconnect: mail.disconnect,
      cancel: mail.cancel,
      fetchEmails: mail.fetchEmails,
    },
  };
}
