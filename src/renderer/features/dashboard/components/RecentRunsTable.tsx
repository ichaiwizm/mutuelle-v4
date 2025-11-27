import { Zap } from 'lucide-react'
import { RunRow } from './RunRow'
import type { Run } from '@/shared/types/run'

interface RecentRunsTableProps {
  runs: Run[]
  cancellingRunId: string | null
  onCancel: (runId: string) => void
  onView: (runId: string) => void
}

export function RecentRunsTable({ runs, cancellingRunId, onCancel, onView }: RecentRunsTableProps) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Zap className="h-8 w-8 text-[var(--color-text-muted)] mb-2" />
        <p className="text-sm text-[var(--color-text-muted)]">No recent runs</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {runs.map(run => (
        <RunRow
          key={run.id}
          run={run}
          isCancelling={cancellingRunId === run.id}
          onCancel={onCancel}
          onView={onView}
        />
      ))}
    </div>
  )
}
