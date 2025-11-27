import { Square, Eye, Loader2 } from 'lucide-react'
import { Button, StatusBadge } from '@/renderer/components/ui'
import { formatTimeAgo } from '@/renderer/lib/formatters'
import type { Run } from '@/shared/types/run'

interface RunRowProps {
  run: Run
  isCancelling: boolean
  onCancel: (runId: string) => void
  onView: (runId: string) => void
}

export function RunRow({ run, isCancelling, onCancel, onView }: RunRowProps) {
  const isCompletedState = ['done', 'failed', 'cancelled'].includes(run.status)

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors">
      <div className="flex items-center gap-4">
        <code className="text-xs font-mono text-[var(--color-text-muted)]">
          {run.id.slice(0, 12)}
        </code>
        <StatusBadge status={run.status} />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--color-text-muted)]">{formatTimeAgo(run.createdAt)}</span>
        {(run.status === 'running' || run.status === 'queued') && (
          <Button variant="ghost" size="sm" onClick={() => onCancel(run.id)} disabled={isCancelling}>
            {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />}
            {isCancelling ? (run.status === 'running' ? 'Stopping...' : 'Cancelling...') : (run.status === 'running' ? 'Stop' : 'Cancel')}
          </Button>
        )}
        {isCompletedState && (
          <Button variant="ghost" size="sm" onClick={() => onView(run.id)}>
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
        )}
      </div>
    </div>
  )
}
