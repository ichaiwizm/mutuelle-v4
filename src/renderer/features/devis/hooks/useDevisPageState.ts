import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { DevisWithLead, DevisStatsResult } from "@/shared/ipc/contracts";
import type { DevisFilters } from "@/shared/types/devis";
import { useDevis } from "./useDevis";

interface UseDevisPageStateResult {
  // Lead selection
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;

  // Devis data
  devisByLead: DevisWithLead[];
  stats: DevisStatsResult | null;

  // Loading states
  loading: boolean;

  // Error state
  error: Error | null;

  // Filters
  filters: DevisFilters;
  setFilters: (filters: DevisFilters) => void;

  // Detail SlideOver
  selectedDevis: DevisWithLead | null;
  setSelectedDevis: (devis: DevisWithLead | null) => void;
  isDetailOpen: boolean;
  openDetail: (devis: DevisWithLead) => void;
  closeDetail: () => void;

  // Delete confirmation
  deleteConfirmDevis: DevisWithLead | null;
  setDeleteConfirmDevis: (devis: DevisWithLead | null) => void;
  isDeleteConfirmOpen: boolean;

  // Generate modal
  isGenerateModalOpen: boolean;
  setGenerateModalOpen: (open: boolean) => void;

  // Actions
  handleRefresh: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleExportPdf: (id: string) => Promise<void>;
  handleDuplicate: (id: string) => Promise<void>;
  handleMarkExpired: (id: string) => Promise<void>;
  handleUpdateNotes: (id: string, notes: string) => Promise<void>;
}

/**
 * Hook for managing DevisPage state
 */
export function useDevisPageState(): UseDevisPageStateResult {
  const [searchParams, setSearchParams] = useSearchParams();

  // Lead selection - URL is the single source of truth (no state sync needed)
  const selectedLeadId = searchParams.get("leadId");

  console.log('[DEVIS-STATE] Render with leadId from URL:', selectedLeadId);

  // Filters
  const [filters, setFilters] = useState<DevisFilters>({});

  // Detail SlideOver
  const [selectedDevis, setSelectedDevis] = useState<DevisWithLead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete confirmation
  const [deleteConfirmDevis, setDeleteConfirmDevis] = useState<DevisWithLead | null>(null);

  // Generate modal
  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);

  // Use the devis hook
  const {
    devisByLead,
    stats,
    loading,
    error,
    fetchDevisByLead,
    fetchStats,
    deleteDevis,
    exportPdf,
    duplicateDevis,
    updateDevis,
    clearError,
    clearDevisByLead,
  } = useDevis();

  // Set lead ID by updating URL (URL is source of truth)
  const setSelectedLeadId = useCallback(
    (id: string | null) => {
      console.log('[DEVIS-STATE] setSelectedLeadId called:', id);
      if (id) {
        setSearchParams({ leadId: id });
      } else {
        // Clear devis data when going back to avoid stale data flash
        clearDevisByLead();
        setSearchParams({});
      }
    },
    [setSearchParams, clearDevisByLead]
  );

  // Track last fetched lead to avoid duplicate fetches
  const lastFetchedLeadRef = useRef<string | null>(null);

  // Load devis when lead is selected (avoid duplicate fetches for same lead)
  useEffect(() => {
    console.log('[DEVIS-STATE] useEffect[selectedLeadId]: changed to:', selectedLeadId, '| last fetched:', lastFetchedLeadRef.current);
    if (selectedLeadId && selectedLeadId !== lastFetchedLeadRef.current) {
      lastFetchedLeadRef.current = selectedLeadId;
      fetchDevisByLead(selectedLeadId).catch(console.error);
    } else if (!selectedLeadId) {
      lastFetchedLeadRef.current = null;
    }
  }, [selectedLeadId, fetchDevisByLead]);

  // Load stats on mount only (not on every navigation)
  useEffect(() => {
    console.log('[DEVIS-STATE] useEffect[mount]: fetching stats...');
    fetchStats().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NOTE: No URL sync useEffect needed - URL is the single source of truth

  // Open detail SlideOver
  const openDetail = useCallback((devis: DevisWithLead) => {
    setSelectedDevis(devis);
    setIsDetailOpen(true);
  }, []);

  // Close detail SlideOver
  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
    // Delay clearing to allow animation
    setTimeout(() => setSelectedDevis(null), 300);
  }, []);

  // Refresh current lead's devis
  const handleRefresh = useCallback(async () => {
    if (selectedLeadId) {
      await fetchDevisByLead(selectedLeadId);
    }
    await fetchStats();
  }, [selectedLeadId, fetchDevisByLead, fetchStats]);

  // Delete devis
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteDevis(id);
      setDeleteConfirmDevis(null);
      await handleRefresh();
    },
    [deleteDevis, handleRefresh]
  );

  // Export PDF
  const handleExportPdf = useCallback(
    async (id: string) => {
      await exportPdf(id);
    },
    [exportPdf]
  );

  // Duplicate devis
  const handleDuplicate = useCallback(
    async (id: string) => {
      await duplicateDevis(id);
      await handleRefresh();
    },
    [duplicateDevis, handleRefresh]
  );

  // Mark as expired
  const handleMarkExpired = useCallback(
    async (id: string) => {
      await updateDevis(id, { status: "expired" });
      await handleRefresh();
    },
    [updateDevis, handleRefresh]
  );

  // Update notes
  const handleUpdateNotes = useCallback(
    async (id: string, notes: string) => {
      await updateDevis(id, { notes });
      await handleRefresh();
    },
    [updateDevis, handleRefresh]
  );

  return {
    // Lead selection
    selectedLeadId,
    setSelectedLeadId,

    // Devis data
    devisByLead,
    stats,

    // Loading states
    loading,

    // Error state
    error,

    // Filters
    filters,
    setFilters,

    // Detail SlideOver
    selectedDevis,
    setSelectedDevis,
    isDetailOpen,
    openDetail,
    closeDetail,

    // Delete confirmation
    deleteConfirmDevis,
    setDeleteConfirmDevis,
    isDeleteConfirmOpen: deleteConfirmDevis !== null,

    // Generate modal
    isGenerateModalOpen,
    setGenerateModalOpen,

    // Actions
    handleRefresh,
    handleDelete,
    handleExportPdf,
    handleDuplicate,
    handleMarkExpired,
    handleUpdateNotes,
  };
}
