import { PauseCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/renderer/components/ui/Button'
import { Skeleton } from '@/renderer/components/ui/Skeleton'
import { EmptyState } from '@/renderer/components/ui/EmptyState'
import { PausedFlowCard } from './PausedFlowCard'
import type { FlowStateDTO } from '@/shared/ipc/contracts'

interface PausedFlowsGridProps {
  flows: FlowStateDTO[]
  loading?: boolean
  resuming?: string | null
  resumingAll?: boolean
  onResume: (id: string) => void
  onResumeAll: () => void
  onDelete: (id: string) => void
}

export function PausedFlowsGrid({
  flows,
  loading,
  resuming,
  resumingAll,
  onResume,
  onResumeAll,
  onDelete,
}: PausedFlowsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-[var(--color-border)]">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--color-border)]">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (flows.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<PauseCircle className="h-8 w-8" />}
          title="No paused flows"
          description="When automation workflows are paused, they will appear here so you can resume them."
        />
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header with Resume All */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--color-text-muted)]">
          {flows.length} paused flow{flows.length !== 1 ? 's' : ''}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={onResumeAll}
          disabled={resumingAll}
        >
          {resumingAll ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Resuming...
            </>
          ) : (
            'Resume All'
          )}
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flows.map((flow, index) => (
          <div
            key={flow.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <PausedFlowCard
              flow={flow}
              isResuming={resuming === flow.id || resumingAll}
              onResume={() => onResume(flow.id)}
              onDelete={() => onDelete(flow.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
