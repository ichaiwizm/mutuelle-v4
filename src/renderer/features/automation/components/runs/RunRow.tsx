import { useNavigate } from 'react-router-dom'
import { TableRow, TableCell } from '@/renderer/components/ui/Table'
import { Button } from '@/renderer/components/ui/Button'
import { XCircle, Loader2, Activity } from 'lucide-react'
import { StatusIndicator } from '../shared/StatusIndicator'
import type { Run } from '@/shared/types/run'

interface RunRowProps {
  run: Run
  index: number
  isCancelling?: boolean
  onCancel: () => void
}

function formatTimeAgo(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function RunRow({ run, index, isCancelling, onCancel }: RunRowProps) {
  const navigate = useNavigate()
  const canCancel = run.status === 'running' || run.status === 'queued'
  const isRunning = run.status === 'running'

  const handleViewRun = () => {
    navigate(`/automation/runs/${run.id}`)
  }

  return (
    <TableRow
      className="hover:bg-[var(--color-surface-hover)] animate-table-row-in cursor-pointer"
      style={{ '--row-index': index } as React.CSSProperties}
      onClick={handleViewRun}
    >
      {/* ID (truncated) */}
      <TableCell className="font-mono text-xs">
        <span
          className="hover:text-[var(--color-primary)] transition-colors"
          title={run.id}
        >
          {run.id.slice(0, 12)}...
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <StatusIndicator status={run.status as any} showLabel size="md" />
      </TableCell>

      {/* Items count */}
      <TableCell className="text-[var(--color-text-muted)]">
        {run.itemsCount ?? '-'}
      </TableCell>

      {/* Created */}
      <TableCell className="text-[var(--color-text-muted)]">
        {formatTimeAgo(run.createdAt)}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isCancelling}
              title={run.status === 'running' ? 'Stop' : 'Cancel'}
              className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          )}
          {isRunning && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10">
              <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400 font-medium">Live</span>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
