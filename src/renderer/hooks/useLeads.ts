import { useEffect, useCallback } from "react";
import { useLeadsStore } from "../stores";
import type { Lead } from "@/shared/types/lead";

/**
 * Hook for leads management with pagination
 */
export function useLeads() {
  const store = useLeadsStore();

  // Initial fetch
  useEffect(() => {
    if (store.leads.length === 0 && store.loading === "idle") {
      store.fetch();
    }
  }, [store]);

  const create = useCallback(
    async (lead: Omit<Lead, "id">) => {
      return store.create(lead);
    },
    [store]
  );

  const update = useCallback(
    async (id: string, data: Partial<Lead>) => {
      return store.update(id, data);
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
    leads: store.leads,
    total: store.total,
    currentPage: store.currentPage,
    pageSize: store.pageSize,
    totalPages: Math.ceil(store.total / store.pageSize),
    loading: store.loading,
    error: store.error,
    isLoading: store.loading === "loading",
    fetch: store.fetch,
    setPage: store.setPage,
    create,
    update,
    remove,
  };
}
