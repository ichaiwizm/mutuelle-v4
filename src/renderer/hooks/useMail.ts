import { useCallback } from "react";
import { useMailStore } from "../stores";

/**
 * Hook for mail operations
 */
export function useMail() {
  const store = useMailStore();

  const connect = useCallback(async () => {
    await store.connect();
  }, [store]);

  const disconnect = useCallback(async () => {
    await store.disconnect();
  }, [store]);

  const fetchEmails = useCallback(
    async (days: number = 7) => {
      return store.fetchEmails(days);
    },
    [store]
  );

  return {
    status: store.status,
    isConnected: store.status?.ok ?? false,
    email: store.status?.email,
    loading: store.loading,
    error: store.error,
    connecting: store.connecting,
    fetching: store.fetching,
    lastFetchResult: store.lastFetchResult,
    connect,
    disconnect,
    fetchEmails,
    checkStatus: store.checkStatus,
  };
}
