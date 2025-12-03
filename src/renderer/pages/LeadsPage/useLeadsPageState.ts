import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useLeads, parseLeadRow } from "@/renderer/features/leads/hooks/useLeads";
import type { Lead } from "@/shared/types/lead";

const PAGE_SIZE = 20;

export function useLeadsPageState() {
  const {
    leads,
    total,
    loading,
    creating,
    updating,
    deleting,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  } = useLeads();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View state
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Selection state for bulk actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Automation modal state
  const [automationModalOpen, setAutomationModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Fetch leads when page changes
  useEffect(() => {
    const offset = (currentPage - 1) * PAGE_SIZE;
    fetchLeads({ limit: PAGE_SIZE, offset });
  }, [currentPage, fetchLeads]);

  // Form handlers
  const handleCreate = useCallback(() => {
    setEditingLead(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingLead(null);
  }, []);

  // View handlers
  const handleView = useCallback((lead: Lead) => {
    setViewingLead(lead);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewingLead(null);
  }, []);

  const handleViewToEdit = useCallback(() => {
    if (viewingLead) {
      setViewingLead(null);
      setEditingLead(viewingLead);
      setIsFormOpen(true);
    }
  }, [viewingLead]);

  // Submit handler
  const handleSubmit = useCallback(
    async (leadData: Partial<Lead>) => {
      setIsSubmitting(true);
      try {
        if (editingLead) {
          await updateLead(editingLead.id, leadData);
          toast.success("Lead mis à jour");
          const offset = (currentPage - 1) * PAGE_SIZE;
          await fetchLeads({ limit: PAGE_SIZE, offset });
        } else {
          const result = await createLead(leadData);
          if (result.duplicate) {
            toast.warning("Ce lead existe déjà");
          } else {
            toast.success("Lead créé");
            setCurrentPage(1);
            await fetchLeads({ limit: PAGE_SIZE, offset: 0 });
          }
        }
        handleCloseForm();
      } catch (error) {
        toast.error(
          editingLead ? "Erreur lors de la mise à jour" : "Erreur lors de la création"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingLead, createLead, updateLead, handleCloseForm, currentPage, fetchLeads]
  );

  // Delete handlers
  const handleDelete = useCallback(
    (id: string) => {
      const leadRow = leads.find((l) => l.id === id);
      const lead = leadRow ? parseLeadRow(leadRow) : null;
      const name = lead ? `${lead.subscriber.prenom} ${lead.subscriber.nom}` : "ce lead";
      setDeleteConfirm({ id, name });
    },
    [leads]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await deleteLead(deleteConfirm.id);
      toast.success("Lead supprimé");

      const isLastItemOnPage = leads.length === 1;
      const shouldGoToPreviousPage = isLastItemOnPage && currentPage > 1;

      if (shouldGoToPreviousPage) {
        setCurrentPage(currentPage - 1);
      } else {
        const offset = (currentPage - 1) * PAGE_SIZE;
        await fetchLeads({ limit: PAGE_SIZE, offset });
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteLead, currentPage, fetchLeads, leads.length]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  // Other handlers
  const handleRefresh = useCallback(() => {
    const offset = (currentPage - 1) * PAGE_SIZE;
    fetchLeads({ limit: PAGE_SIZE, offset });
  }, [currentPage, fetchLeads]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedLeadIds(new Set());
  }, []);

  const handleSendToAutomation = useCallback(() => {
    setAutomationModalOpen(true);
  }, []);

  const handleAutomationModalClose = useCallback(() => {
    setAutomationModalOpen(false);
  }, []);

  const handleAutomationSuccess = useCallback(() => {
    setSelectedLeadIds(new Set());
    setAutomationModalOpen(false);
  }, []);

  return {
    // Data
    leads,
    total,
    loading,
    // Pagination
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    handlePageChange,
    // Form state
    isFormOpen,
    editingLead,
    isSubmitting,
    handleCreate,
    handleEdit,
    handleCloseForm,
    handleSubmit,
    // View state
    viewingLead,
    handleView,
    handleCloseView,
    handleViewToEdit,
    // Delete state
    deleteConfirm,
    handleDelete,
    confirmDelete,
    cancelDelete,
    // Selection state
    selectedLeadIds,
    setSelectedLeadIds,
    handleClearSelection,
    handleSendToAutomation,
    // Automation modal
    automationModalOpen,
    handleAutomationModalClose,
    handleAutomationSuccess,
    // Refresh
    handleRefresh,
  };
}
