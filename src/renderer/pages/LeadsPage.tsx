import { useState, useCallback } from "react";
import { Button } from "@/renderer/components/ui/Button";
import { SlideOver } from "@/renderer/components/ui/SlideOver";
import { UserPlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLeads, parseLeadRow } from "@/renderer/features/leads/hooks/useLeads";
import { LeadList } from "@/renderer/features/leads/components/LeadList";
import { LeadForm } from "@/renderer/features/leads/components/LeadForm";
import { LeadDetails } from "@/renderer/features/leads/components/LeadDetails";
import type { Lead } from "@/shared/types/lead";

export function LeadsPage() {
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

  /**
   * Open form for creating new lead
   */
  const handleCreate = useCallback(() => {
    console.log("[LeadsPage] handleCreate called");
    setEditingLead(null);
    setIsFormOpen(true);
  }, []);

  /**
   * Open form for editing lead
   */
  const handleEdit = useCallback((lead: Lead) => {
    console.log("[LeadsPage] handleEdit called with lead:", lead);
    setEditingLead(lead);
    setIsFormOpen(true);
  }, []);

  /**
   * Close form
   */
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingLead(null);
  }, []);

  /**
   * Open view panel for a lead
   */
  const handleView = useCallback((lead: Lead) => {
    setViewingLead(lead);
  }, []);

  /**
   * Close view panel
   */
  const handleCloseView = useCallback(() => {
    setViewingLead(null);
  }, []);

  /**
   * Switch from view to edit mode
   */
  const handleViewToEdit = useCallback(() => {
    if (viewingLead) {
      setViewingLead(null);
      setEditingLead(viewingLead);
      setIsFormOpen(true);
    }
  }, [viewingLead]);

  /**
   * Submit form (create or update)
   */
  const handleSubmit = useCallback(
    async (leadData: Partial<Lead>) => {
      console.log("[LeadsPage] handleSubmit called", {
        isEditing: !!editingLead,
        editingLeadId: editingLead?.id,
        leadData,
      });
      setIsSubmitting(true);
      try {
        if (editingLead) {
          console.log("[LeadsPage] Calling updateLead...");
          await updateLead(editingLead.id, leadData);
          console.log("[LeadsPage] updateLead completed");
          toast.success("Lead mis à jour");
        } else {
          console.log("[LeadsPage] Calling createLead...");
          const result = await createLead(leadData);
          console.log("[LeadsPage] createLead result:", result);
          if (result.duplicate) {
            toast.warning("Ce lead existe déjà");
          } else {
            toast.success("Lead créé");
          }
        }
        handleCloseForm();
      } catch (error) {
        console.error("[LeadsPage] handleSubmit error:", error);
        toast.error(
          editingLead
            ? "Erreur lors de la mise à jour"
            : "Erreur lors de la création"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingLead, createLead, updateLead, handleCloseForm]
  );

  /**
   * Delete lead with confirmation
   */
  const handleDelete = useCallback(
    async (id: string) => {
      console.log("[LeadsPage] handleDelete called with id:", id);
      // Find the lead to show its name
      const leadRow = leads.find((l) => l.id === id);
      const lead = leadRow ? parseLeadRow(leadRow) : null;
      const name = lead
        ? `${lead.subscriber.prenom} ${lead.subscriber.nom}`
        : "ce lead";

      if (!confirm(`Supprimer ${name} ?`)) return;

      try {
        console.log("[LeadsPage] Calling deleteLead...");
        await deleteLead(id);
        console.log("[LeadsPage] deleteLead completed");
        toast.success("Lead supprimé");
      } catch (error) {
        console.error("[LeadsPage] handleDelete error:", error);
        toast.error("Erreur lors de la suppression");
      }
    },
    [leads, deleteLead]
  );

  /**
   * Refresh leads list
   */
  const handleRefresh = useCallback(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)] font-display">
            Leads
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {total} lead{total > 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            title="Rafraîchir"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={handleCreate}>
            <UserPlus className="h-4 w-4" />
            Nouveau lead
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <LeadList
          leads={leads}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
      </div>

      {/* Form SlideOver */}
      <SlideOver
        open={isFormOpen}
        onClose={handleCloseForm}
        title={editingLead ? "Modifier le lead" : "Nouveau lead"}
        description={
          editingLead
            ? `Modification de ${editingLead.subscriber.prenom} ${editingLead.subscriber.nom}`
            : "Remplissez les informations du lead"
        }
        width="xl"
      >
        <LeadForm
          lead={editingLead || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      </SlideOver>

      {/* View SlideOver */}
      <SlideOver
        open={!!viewingLead}
        onClose={handleCloseView}
        title="Details du lead"
        description={
          viewingLead
            ? `${viewingLead.subscriber.prenom} ${viewingLead.subscriber.nom}`
            : undefined
        }
        width="lg"
      >
        {viewingLead && (
          <LeadDetails
            lead={viewingLead}
            onEdit={handleViewToEdit}
            onClose={handleCloseView}
          />
        )}
      </SlideOver>
    </div>
  );
}
