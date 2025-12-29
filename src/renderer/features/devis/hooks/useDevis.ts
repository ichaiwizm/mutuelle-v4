import { useState, useCallback } from "react";
import type { Devis, DevisFilters, CreateDevisInput, UpdateDevisInput } from "@/shared/types/devis";
import type {
  DevisRow,
  DevisWithLead,
  DevisStatsResult,
  DevisCountByLeadResult,
} from "@/shared/ipc/contracts";

interface UseDevisResult {
  // Data
  devisList: DevisRow[];
  total: number;
  currentDevis: Devis | null;
  devisByLead: DevisWithLead[];
  stats: DevisStatsResult | null;

  // Loading states
  loading: boolean;
  loadingStats: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  exporting: boolean;
  duplicating: boolean;

  // Error state
  error: Error | null;

  // CRUD operations
  fetchDevis: (options?: { limit?: number; offset?: number; filters?: DevisFilters }) => Promise<void>;
  fetchDevisByLead: (leadId: string) => Promise<void>;
  fetchSingleDevis: (id: string) => Promise<Devis | null>;
  createDevis: (input: CreateDevisInput) => Promise<{ id: string }>;
  updateDevis: (id: string, data: UpdateDevisInput) => Promise<void>;
  deleteDevis: (id: string) => Promise<void>;
  exportPdf: (id: string) => Promise<{ success: boolean; exportedPath?: string }>;
  duplicateDevis: (id: string) => Promise<{ id: string }>;
  countByLead: (leadIds: string[]) => Promise<DevisCountByLeadResult>;
  fetchStats: () => Promise<void>;

  // Utilities
  clearError: () => void;
  clearCurrentDevis: () => void;
  clearDevisByLead: () => void;
}

/**
 * Hook for managing devis (quotes) via IPC
 */
export function useDevis(): UseDevisResult {
  // Data state
  const [devisList, setDevisList] = useState<DevisRow[]>([]);
  const [total, setTotal] = useState(0);
  const [currentDevis, setCurrentDevis] = useState<Devis | null>(null);
  const [devisByLead, setDevisByLead] = useState<DevisWithLead[]>([]);
  const [stats, setStats] = useState<DevisStatsResult | null>(null);

  // Loading states - separated to avoid flicker
  const [loadingDevis, setLoadingDevis] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  // Error state
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch devis list with pagination and filters
   */
  const fetchDevis = useCallback(
    async (options?: { limit?: number; offset?: number; filters?: DevisFilters }) => {
      setLoadingDevis(true);
      setError(null);

      try {
        const result = await window.api.devis.list(options);
        setDevisList(result.devis);
        setTotal(result.total);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Échec du chargement des devis");
        setError(error);
        throw error;
      } finally {
        setLoadingDevis(false);
      }
    },
    []
  );

  /**
   * Fetch all devis for a specific lead
   */
  const fetchDevisByLead = useCallback(async (leadId: string) => {
    console.log('[DEVIS] fetchDevisByLead START:', leadId);
    setError(null);

    // Delayed loading to avoid skeleton flash for fast fetches
    const loadingTimeout = setTimeout(() => setLoadingDevis(true), 150);

    try {
      const result = await window.api.devis.listByLead(leadId);
      console.log('[DEVIS] fetchDevisByLead END:', result.devis.length, 'devis loaded');
      setDevisByLead(result.devis);
    } catch (err) {
      console.log('[DEVIS] fetchDevisByLead ERROR:', err);
      const error = err instanceof Error ? err : new Error("Échec du chargement des devis du lead");
      setError(error);
      throw error;
    } finally {
      clearTimeout(loadingTimeout);
      setLoadingDevis(false);
    }
  }, []);

  /**
   * Fetch a single devis by ID
   */
  const fetchSingleDevis = useCallback(async (id: string): Promise<Devis | null> => {
    setLoadingDevis(true);
    setError(null);

    try {
      const devis = await window.api.devis.get(id);
      setCurrentDevis(devis);
      return devis;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Échec du chargement du devis");
      setError(error);
      throw error;
    } finally {
      setLoadingDevis(false);
    }
  }, []);

  /**
   * Create a new devis
   */
  const createDevis = useCallback(async (input: CreateDevisInput): Promise<{ id: string }> => {
    setCreating(true);
    setError(null);

    try {
      const result = await window.api.devis.create(input);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Échec de la création du devis");
      setError(error);
      throw error;
    } finally {
      setCreating(false);
    }
  }, []);

  /**
   * Update an existing devis
   */
  const updateDevis = useCallback(async (id: string, data: UpdateDevisInput): Promise<void> => {
    setUpdating(true);
    setError(null);

    try {
      await window.api.devis.update(id, data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Échec de la mise à jour du devis");
      setError(error);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, []);

  /**
   * Delete a devis
   */
  const deleteDevis = useCallback(async (id: string): Promise<void> => {
    setDeleting(true);
    setError(null);

    try {
      await window.api.devis.delete(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Échec de la suppression du devis");
      setError(error);
      throw error;
    } finally {
      setDeleting(false);
    }
  }, []);

  /**
   * Export devis PDF to user-selected location
   */
  const exportPdf = useCallback(
    async (id: string): Promise<{ success: boolean; exportedPath?: string }> => {
      setExporting(true);
      setError(null);

      try {
        const result = await window.api.devis.exportPdf(id);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Échec de l'export du PDF");
        setError(error);
        throw error;
      } finally {
        setExporting(false);
      }
    },
    []
  );

  /**
   * Duplicate a devis
   */
  const duplicateDevis = useCallback(async (id: string): Promise<{ id: string }> => {
    setDuplicating(true);
    setError(null);

    try {
      const result = await window.api.devis.duplicate(id);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Échec de la duplication du devis");
      setError(error);
      throw error;
    } finally {
      setDuplicating(false);
    }
  }, []);

  /**
   * Count devis per lead
   */
  const countByLead = useCallback(async (leadIds: string[]): Promise<DevisCountByLeadResult> => {
    try {
      return await window.api.devis.countByLead(leadIds);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Échec du comptage des devis");
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Fetch devis statistics
   */
  const fetchStats = useCallback(async () => {
    console.log('[DEVIS] fetchStats START');
    setLoadingStats(true);
    setError(null);

    try {
      const result = await window.api.devis.stats();
      console.log('[DEVIS] fetchStats END:', result);
      setStats(result);
    } catch (err) {
      console.log('[DEVIS] fetchStats ERROR:', err);
      const error = err instanceof Error ? err : new Error("Échec du chargement des statistiques");
      setError(error);
      throw error;
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear current devis
   */
  const clearCurrentDevis = useCallback(() => {
    setCurrentDevis(null);
  }, []);

  /**
   * Clear devis by lead data (used when going back)
   */
  const clearDevisByLead = useCallback(() => {
    setDevisByLead([]);
  }, []);

  return {
    devisList,
    total,
    currentDevis,
    devisByLead,
    stats,
    loading: loadingDevis, // Main loading state for devis grid
    loadingStats,
    creating,
    updating,
    deleting,
    exporting,
    duplicating,
    error,
    fetchDevis,
    fetchDevisByLead,
    fetchSingleDevis,
    createDevis,
    updateDevis,
    deleteDevis,
    exportPdf,
    duplicateDevis,
    countByLead,
    fetchStats,
    clearError,
    clearCurrentDevis,
    clearDevisByLead,
  };
}

/**
 * Parse a DevisRow to get the Devis data
 */
export function parseDevisRow(row: DevisRow): Devis {
  return {
    id: row.id,
    leadId: row.leadId,
    flowKey: row.flowKey,
    status: row.status as Devis["status"],
    data: row.data ? JSON.parse(row.data) : null,
    pdfPath: row.pdfPath,
    errorMessage: row.errorMessage,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    expiresAt: row.expiresAt,
  };
}
