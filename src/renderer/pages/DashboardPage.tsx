import { useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/renderer/components/ui'
import { useDashboardContext } from '@/renderer/contexts/DashboardContext'
import { useDashboardActions } from '@/renderer/features/dashboard/hooks/useDashboardActions'
import {
  DashboardHeader,
  StatsGrid,
  RecentRunsCard,
  ActiveProductsCard,
  RunDetailsModal,
} from '@/renderer/features/dashboard/components'
import { RunConfirmDialog } from '@/renderer/features/automation/components'

export function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardContext()
  const actions = useDashboardActions({ refetch })

  // Confirmation state
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

  const handleCancelRequest = useCallback((runId: string) => {
    setConfirmCancelId(runId)
  }, [])

  const handleConfirmCancel = useCallback(() => {
    if (confirmCancelId) {
      actions.handleCancelRun(confirmCancelId)
      setConfirmCancelId(null)
    }
  }, [confirmCancelId, actions])

  const handleCancelConfirm = useCallback(() => {
    setConfirmCancelId(null)
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-[var(--color-error)]">Failed to load dashboard</p>
        <Button onClick={refetch}>Retry</Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <DashboardHeader
        isFetching={actions.isFetching}
        isMailConnected={data.mail.ok}
        onFetchEmails={actions.handleFetchEmails}
        onCancelFetch={actions.handleCancelFetch}
      />

      <StatsGrid
        totalLeads={data.leads.total}
        totalRuns={data.automation.totalRuns}
        recentRuns={data.automation.recentRuns}
      />

      <div className="grid grid-cols-3 gap-4">
        <RecentRunsCard
          runs={data.automation.recentRuns}
          onCancel={handleCancelRequest}
          onView={actions.handleViewRun}
          cancellingRunId={actions.cancellingRunId}
        />

        <ActiveProductsCard
          products={data.products.active}
          activeCount={data.products.activeCount}
        />
      </div>

      <RunDetailsModal runId={actions.viewingRunId} onClose={actions.handleCloseModal} />

      <RunConfirmDialog
        action={confirmCancelId ? 'cancel' : null}
        runId={confirmCancelId}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelConfirm}
      />
    </div>
  )
}
