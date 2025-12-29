import { RefreshCw, Plus, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";
import { Dialog } from "@/renderer/components/ui/Dialog/Dialog";
import {
  DevisGrid,
  DevisFilters,
  DevisDetail,
  LeadSelector,
  GenerateDevisModal,
  useDevisPageState,
} from "@/renderer/features/devis";

/**
 * Devis (Quotes) Page
 *
 * Allows viewing and managing quotes per lead.
 * Supports deep linking via ?leadId=xxx query parameter.
 */
export function DevisPage() {
  const {
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
    isDetailOpen,
    openDetail,
    closeDetail,

    // Delete confirmation
    deleteConfirmDevis,
    setDeleteConfirmDevis,
    isDeleteConfirmOpen,

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
  } = useDevisPageState();

  console.log('[DEVIS-PAGE] Render:', { selectedLeadId, loading, devisCount: devisByLead.length });

  // Get lead name for display
  const currentLeadName = devisByLead[0]?.leadName;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          {selectedLeadId && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedLeadId(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Devis
              {currentLeadName && (
                <span className="text-[var(--color-text-muted)] font-normal">
                  - {currentLeadName}
                </span>
              )}
            </h1>
            {stats && (
              <p className="text-sm text-[var(--color-text-muted)]">
                {stats.total} devis au total
                {stats.pending > 0 && ` • ${stats.pending} en attente`}
                {stats.completed > 0 && ` • ${stats.completed} complétés`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            size="sm"
            onClick={() => setGenerateModalOpen(true)}
            disabled // Disabled until flow integration
          >
            <Plus className="h-4 w-4 mr-1" />
            Nouveau devis
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Error state */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-[var(--color-error)]/10 text-[var(--color-error)]">
            {error.message}
          </div>
        )}

        {/* Lead selector - kept mounted but hidden to avoid reload on "back" */}
        <div className={selectedLeadId ? "hidden" : ""}>
          <LeadSelector onSelectLead={setSelectedLeadId} />
        </div>

        {/* Lead selected - show devis */}
        {selectedLeadId && (
          <div className="space-y-4">
            {/* Filters */}
            <DevisFilters
              filters={filters}
              onFiltersChange={setFilters}
              flowKeys={[...new Set(devisByLead.map((d) => d.flowKey))]}
            />

            {/* Devis grid */}
            <DevisGrid
              devis={devisByLead}
              loading={loading}
              onView={openDetail}
              onExportPdf={handleExportPdf}
              onDuplicate={handleDuplicate}
              onMarkExpired={handleMarkExpired}
              onDelete={setDeleteConfirmDevis}
              onGenerate={() => setGenerateModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Detail SlideOver */}
      <DevisDetail
        devis={selectedDevis}
        open={isDetailOpen}
        onClose={closeDetail}
        onExportPdf={handleExportPdf}
        onDuplicate={handleDuplicate}
        onMarkExpired={handleMarkExpired}
        onDelete={setDeleteConfirmDevis}
        onUpdateNotes={handleUpdateNotes}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmDevis(null)}
        maxWidth="sm"
      >
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold">Supprimer le devis</h2>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-[var(--color-text-muted)]">
            Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.
            {deleteConfirmDevis?.pdfPath && (
              <span className="block mt-2 text-sm">
                Le fichier PDF associé sera également supprimé.
              </span>
            )}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirmDevis(null)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirmDevis && handleDelete(deleteConfirmDevis.id)}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Generate modal */}
      <GenerateDevisModal
        open={isGenerateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        leadName={currentLeadName}
      />
    </div>
  );
}
