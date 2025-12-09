import { useState, useCallback } from 'react'
import { Pagination } from '@/renderer/components/ui/Pagination'
import {
  AutomationHeader,
  AutomationTabs,
  RunsTable,
  RunFilters,
  ProductsTab,
  NewRunModal,
  RunConfirmDialog,
  type RunActionType,
} from '@/renderer/features/automation/components'
import { useAutomation } from '@/renderer/features/automation/hooks/useAutomation'
import { useProducts } from '@/renderer/features/automation/hooks/useProducts'
import type { TabType } from '@/renderer/features/automation/types'

export function AutomationPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('runs')
  const [showNewRunModal, setShowNewRunModal] = useState(false)

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<{
    type: RunActionType
    runId: string
  } | null>(null)

  // Hooks
  const automation = useAutomation()
  const products = useProducts()

  // Handlers
  const handleNewRun = useCallback(() => {
    setShowNewRunModal(true)
  }, [])

  const handleNewRunSuccess = useCallback(() => {
    setShowNewRunModal(false)
    automation.fetchRuns()
  }, [automation])

  const handleRefresh = useCallback(() => {
    automation.fetchRuns()
    products.fetchProducts()
  }, [automation, products])

  // Confirmation handlers
  const handleDeleteRequest = useCallback((runId: string) => {
    setConfirmAction({ type: 'delete', runId })
  }, [])

  const handleCancelRequest = useCallback((runId: string) => {
    setConfirmAction({ type: 'cancel', runId })
  }, [])

  const handleConfirmAction = useCallback(() => {
    if (!confirmAction) return
    if (confirmAction.type === 'delete') {
      automation.deleteRun(confirmAction.runId)
    } else if (confirmAction.type === 'cancel') {
      automation.cancelRun(confirmAction.runId)
    }
    setConfirmAction(null)
  }, [confirmAction, automation])

  const handleCancelConfirm = useCallback(() => {
    setConfirmAction(null)
  }, [])

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header with stats */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <AutomationHeader
          stats={automation.stats}
          loading={automation.loading}
          onNewRun={handleNewRun}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Tabs */}
      <div className="px-6">
        <AutomationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          productsCount={products.products.filter((p) => p.isActive).length}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'runs' && (
          <div className="flex flex-col h-full">
            {/* Filters */}
            <RunFilters
              filters={automation.filters}
              onFiltersChange={automation.setFilters}
            />

            {/* Table */}
            <div className="flex-1 overflow-auto p-4">
              <RunsTable
                runs={automation.runs}
                loading={automation.loading}
                cancelling={automation.cancelling}
                deleting={automation.deleting}
                retrying={automation.retrying}
                onCancel={handleCancelRequest}
                onDelete={handleDeleteRequest}
                onRetry={automation.retryRun}
                onNewRun={handleNewRun}
              />
            </div>

            {/* Pagination */}
            {automation.total > 0 && (
              <div className="px-6 py-3 border-t border-[var(--color-border)]">
                <Pagination
                  currentPage={automation.currentPage}
                  totalPages={automation.totalPages}
                  totalItems={automation.total}
                  pageSize={automation.pageSize}
                  onPageChange={automation.setCurrentPage}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <ProductsTab
            products={products.products}
            loading={products.loading}
            toggling={products.toggling}
            onToggle={products.toggleProduct}
          />
        )}
      </div>

      {/* New Run Modal */}
      <NewRunModal
        isOpen={showNewRunModal}
        onClose={() => setShowNewRunModal(false)}
        onSuccess={handleNewRunSuccess}
      />

      {/* Confirmation Dialog */}
      <RunConfirmDialog
        action={confirmAction?.type ?? null}
        runId={confirmAction?.runId ?? null}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirm}
      />
    </div>
  )
}
