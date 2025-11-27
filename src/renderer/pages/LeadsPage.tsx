import { Pagination } from '@/renderer/components/ui'
import {
  LeadsHeader,
  LeadsTable,
  LeadDetailsPanel,
  LeadFormModal,
  DeleteConfirmDialog,
  LeadsLoadingState,
  LeadsErrorState,
  useLeads,
  useLeadsPage,
} from '@/renderer/features/leads'

export function LeadsPage() {
  const { leads, total, loading, error, page, pageSize, totalPages, setPage, refetch } = useLeads()
  const { searchQuery, setSearchQuery, selectedLead, isFormOpen, editingLead, deletingLead, handlers } =
    useLeadsPage()

  const filteredLeads = searchQuery
    ? leads.filter((lead) => {
        const searchLower = searchQuery.toLowerCase()
        const { subscriber } = lead
        return (
          subscriber.nom?.toLowerCase().includes(searchLower) ||
          subscriber.prenom?.toLowerCase().includes(searchLower) ||
          subscriber.email?.toLowerCase().includes(searchLower) ||
          subscriber.telephone?.includes(searchQuery) ||
          subscriber.ville?.toLowerCase().includes(searchLower)
        )
      })
    : leads

  if (loading && leads.length === 0) return <LeadsLoadingState />
  if (error) return <LeadsErrorState onRetry={refetch} />

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <LeadsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateClick={handlers.create}
        totalLeads={total}
      />

      <LeadsTable
        leads={filteredLeads}
        searchQuery={searchQuery}
        onView={handlers.view}
        onEdit={handlers.edit}
        onDelete={handlers.delete}
        onCreateClick={handlers.create}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}

      <LeadDetailsPanel
        lead={selectedLead}
        open={!!selectedLead}
        onClose={handlers.closeDetails}
        onEdit={handlers.editFromDetails}
      />

      <LeadFormModal open={isFormOpen} onClose={handlers.closeForm} lead={editingLead} onSuccess={refetch} />

      <DeleteConfirmDialog
        lead={deletingLead}
        open={!!deletingLead}
        onClose={handlers.closeDelete}
        onSuccess={refetch}
      />
    </div>
  )
}
