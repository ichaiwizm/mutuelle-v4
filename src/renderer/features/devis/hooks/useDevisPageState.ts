import { useState, useCallback, useEffect } from "react";
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
  const initialLeadId = searchParams.get("leadId");

  // Lead selection
  const [selectedLeadId, setSelectedLeadIdState] = useState<string | null>(initialLeadId);

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
  } = useDevis();

  // Set lead ID and update URL
  const setSelectedLeadId = useCallback(
    (id: string | null) => {
      setSelectedLeadIdState(id);
      if (id) {
        setSearchParams({ leadId: id });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams]
  );

  // Load devis when lead is selected
  useEffect(() => {
    if (selectedLeadId) {
      fetchDevisByLead(selectedLeadId).catch(console.error);
    }
  }, [selectedLeadId, fetchDevisByLead]);

  // Load stats on mount
  useEffect(() => {
    fetchStats().catch(console.error);
  }, [fetchStats]);

  // Handle URL changes
  useEffect(() => {
    const leadId = searchParams.get("leadId");
    if (leadId !== selectedLeadId) {
      setSelectedLeadIdState(leadId);
    }
  }, [searchParams, selectedLeadId]);

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
