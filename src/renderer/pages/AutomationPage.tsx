import { useState, useCallback } from 'react'
import { Pagination } from '@/renderer/components/ui/Pagination'
import {
  AutomationHeader,
  AutomationTabs,
  RunsTable,
  RunFilters,
  ProductsTab,
  NewRunModal,
} from '@/renderer/features/automation/components'
import { useAutomation } from '@/renderer/features/automation/hooks/useAutomation'
import { useProducts } from '@/renderer/features/automation/hooks/useProducts'
import type { TabType } from '@/renderer/features/automation/types'

export function AutomationPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('runs')
  const [showNewRunModal, setShowNewRunModal] = useState(false)

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
                onCancel={automation.cancelRun}
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
    </div>
  )
}
