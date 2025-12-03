import { SlideOver } from "@/renderer/components/ui/SlideOver";
import { Pagination } from "@/renderer/components/ui/Pagination";
import { LeadList } from "@/renderer/features/leads/components/LeadList";
import { LeadForm } from "@/renderer/features/leads/components/LeadForm";
import { LeadDetails } from "@/renderer/features/leads/components/LeadDetails";
import { NewRunModal } from "@/renderer/features/automation/components/NewRunModal";
import { useLeadsPageState } from "./useLeadsPageState";
import { LeadsHeader, SelectionActionBar, DeleteConfirmDialog } from "./components";

export function LeadsPage() {
  const {
    leads,
    total,
    loading,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    isFormOpen,
    editingLead,
    isSubmitting,
    handleCreate,
    handleEdit,
    handleCloseForm,
    handleSubmit,
    viewingLead,
    handleView,
    handleCloseView,
    handleViewToEdit,
    deleteConfirm,
    handleDelete,
    confirmDelete,
    cancelDelete,
    selectedLeadIds,
    setSelectedLeadIds,
    handleClearSelection,
    handleSendToAutomation,
    automationModalOpen,
    handleAutomationModalClose,
    handleAutomationSuccess,
    handleRefresh,
  } = useLeadsPageState();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <LeadsHeader
        total={total}
        loading={loading}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <LeadList
          leads={leads}
          loading={loading}
          selectedIds={selectedLeadIds}
          onSelectionChange={setSelectedLeadIds}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
      </div>

      {/* Selection Action Bar */}
      <SelectionActionBar
        selectedCount={selectedLeadIds.size}
        onSendToAutomation={handleSendToAutomation}
        onClearSelection={handleClearSelection}
      />

      {/* Pagination */}
      {total > 0 && (
        <div className="px-6 py-3 border-t border-[var(--color-border)]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}

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
          <LeadDetails lead={viewingLead} onEdit={handleViewToEdit} onClose={handleCloseView} />
        )}
      </SlideOver>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        deleteConfirm={deleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Automation Modal */}
      <NewRunModal
        open={automationModalOpen}
        onClose={handleAutomationModalClose}
        preSelectedLeadIds={Array.from(selectedLeadIds)}
        onSuccess={handleAutomationSuccess}
      />
    </div>
  );
}
