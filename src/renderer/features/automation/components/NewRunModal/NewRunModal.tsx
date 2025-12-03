import { Play, Loader2 } from "lucide-react";
import { Modal } from "@/renderer/components/ui/Modal/Modal";
import { ModalHeader } from "@/renderer/components/ui/Modal/ModalHeader";
import { Button } from "@/renderer/components/ui/Button";
import type { NewRunModalProps } from "./types";
import { useNewRunModal } from "./useNewRunModal";
import { ProductSelector, LeadSelector, SummaryCard } from "./sections";

export function NewRunModal({
  isOpen: isOpenProp,
  open,
  onClose,
  onSuccess,
  preSelectedLeadIds,
}: NewRunModalProps) {
  // Support both isOpen and open props
  const isOpen = isOpenProp ?? open ?? false;

  const {
    products,
    leads,
    loadingProducts,
    loadingLeads,
    selectedFlows,
    selectedLeads,
    toggleFlow,
    toggleLead,
    toggleAllFlows,
    toggleAllLeads,
    selectLastN,
    searchQuery,
    setSearchQuery,
    totalTasks,
    canSubmit,
    estimatedDuration,
    quickSelectOptions,
    submitting,
    handleSubmit,
  } = useNewRunModal({ isOpen, preSelectedLeadIds, onSuccess, onClose });

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <ModalHeader title="Nouvelle Automation" onClose={onClose} />

      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Products Section */}
        <ProductSelector
          products={products}
          loading={loadingProducts}
          selectedFlows={selectedFlows}
          toggleFlow={toggleFlow}
          toggleAllFlows={toggleAllFlows}
        />

        {/* Leads Section */}
        <LeadSelector
          leads={leads}
          loading={loadingLeads}
          selectedLeads={selectedLeads}
          toggleLead={toggleLead}
          toggleAllLeads={toggleAllLeads}
          selectLastN={selectLastN}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          quickSelectOptions={quickSelectOptions}
        />

        {/* Summary */}
        <SummaryCard
          selectedFlowsCount={selectedFlows.size}
          selectedLeadsCount={selectedLeads.size}
          totalTasks={totalTasks}
          estimatedDuration={estimatedDuration}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Lancement...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Lancer {totalTasks > 0 ? `${totalTasks} tâche${totalTasks > 1 ? "s" : ""}` : ""}
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
