import { useState, useCallback, useEffect } from "react";
import type { Lead } from "@/shared/types/lead";

export type LeadRow = {
  id: string;
  data: string;
  createdAt: Date;
  updatedAt: Date;
};

interface UseLeadsResult {
  // Data
  leads: LeadRow[];
  total: number;
  currentLead: Lead | null;

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // Error state
  error: Error | null;

  // CRUD operations
  fetchLeads: (options?: { limit?: number; offset?: number }) => Promise<void>;
  fetchLead: (id: string) => Promise<Lead | null>;
  createLead: (lead: Partial<Lead>) => Promise<{ id: string; duplicate?: boolean }>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  // Utilities
  clearError: () => void;
  clearCurrentLead: () => void;
}

/**
 * Hook for managing leads via IPC
 */
export function useLeads(): UseLeadsResult {
  // Data state
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Error state
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch leads list with pagination
   */
  const fetchLeads = useCallback(
    async (options?: { limit?: number; offset?: number }) => {
      console.log("[useLeads] fetchLeads called with options:", options);
      setLoading(true);
      setError(null);

      try {
        const result = await window.api.leads.list(options);
        console.log("[useLeads] fetchLeads result:", { count: result.leads.length, total: result.total });
        setLeads(result.leads);
        setTotal(result.total);
      } catch (err) {
        console.error("[useLeads] fetchLeads error:", err);
        const error = err instanceof Error ? err : new Error("Failed to fetch leads");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Fetch a single lead by ID
   */
  const fetchLead = useCallback(async (id: string): Promise<Lead | null> => {
    setLoading(true);
    setError(null);

    try {
      const lead = await window.api.leads.get(id);
      setCurrentLead(lead);
      return lead;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch lead");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new lead
   * Note: Caller should refresh the list with proper pagination after success
   */
  const createLead = useCallback(
    async (lead: Partial<Lead>): Promise<{ id: string; duplicate?: boolean }> => {
      console.log("[useLeads] createLead called with:", lead);
      setCreating(true);
      setError(null);

      try {
        const result = await window.api.leads.create(lead);
        console.log("[useLeads] createLead result:", result);
        return result;
      } catch (err) {
        console.error("[useLeads] createLead error:", err);
        const error = err instanceof Error ? err : new Error("Failed to create lead");
        setError(error);
        throw error;
      } finally {
        setCreating(false);
      }
    },
    []
  );

  /**
   * Update an existing lead
   * Note: Caller should refresh the list with proper pagination after success
   */
  const updateLead = useCallback(
    async (id: string, data: Partial<Lead>): Promise<void> => {
      console.log("[useLeads] updateLead called with:", { id, data });
      setUpdating(true);
      setError(null);

      try {
        console.log("[useLeads] Calling window.api.leads.update...");
        await window.api.leads.update(id, data);
        console.log("[useLeads] updateLead API call completed");
      } catch (err) {
        console.error("[useLeads] updateLead error:", err);
        const error = err instanceof Error ? err : new Error("Failed to update lead");
        setError(error);
        throw error;
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  /**
   * Delete a lead
   * Note: Caller should refresh the list with proper pagination after success
   */
  const deleteLead = useCallback(
    async (id: string): Promise<void> => {
      console.log("[useLeads] deleteLead called with id:", id);
      setDeleting(true);
      setError(null);

      try {
        console.log("[useLeads] Calling window.api.leads.remove...");
        await window.api.leads.remove(id);
        console.log("[useLeads] deleteLead API call completed");
      } catch (err) {
        console.error("[useLeads] deleteLead error:", err);
        const error = err instanceof Error ? err : new Error("Failed to delete lead");
        setError(error);
        throw error;
      } finally {
        setDeleting(false);
      }
    },
    []
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear current lead
   */
  const clearCurrentLead = useCallback(() => {
    setCurrentLead(null);
  }, []);

  // Note: Auto-fetch removed - consuming component should call fetchLeads with pagination params

  return {
    leads,
    total,
    currentLead,
    loading,
    creating,
    updating,
    deleting,
    error,
    fetchLeads,
    fetchLead,
    createLead,
    updateLead,
    deleteLead,
    clearError,
    clearCurrentLead,
  };
}

/**
 * Parse a LeadRow to get the Lead object
 */
export function parseLeadRow(row: LeadRow): Lead {
  return JSON.parse(row.data) as Lead;
}
