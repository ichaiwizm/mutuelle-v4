import { TableRow, TableCell } from '@/renderer/components/ui/Table'
import { Button } from '@/renderer/components/ui/Button'
import { Eye, XCircle, Loader2 } from 'lucide-react'
import { StatusIndicator } from '../shared/StatusIndicator'
import type { Run } from '@/shared/types/run'

interface RunRowProps {
  run: Run
  index: number
  isCancelling?: boolean
  onCancel: () => void
  onView: () => void
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

export function RunRow({ run, index, isCancelling, onCancel, onView }: RunRowProps) {
  const canCancel = run.status === 'running' || run.status === 'queued'
  const canView = ['done', 'failed', 'cancelled'].includes(run.status)

  return (
    <TableRow
      className="hover:bg-[var(--color-surface-hover)] animate-table-row-in"
      style={{ '--row-index': index } as React.CSSProperties}
    >
      {/* ID (truncated) */}
      <TableCell className="font-mono text-xs">
        <span
          className="cursor-pointer hover:text-[var(--color-primary)] transition-colors"
          onClick={onView}
          title={run.id}
        >
          {run.id.slice(0, 12)}...
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <StatusIndicator status={run.status as any} showLabel size="md" />
      </TableCell>

      {/* Items count - placeholder, will be enhanced */}
      <TableCell className="text-[var(--color-text-muted)]">
        -
      </TableCell>

      {/* Created */}
      <TableCell className="text-[var(--color-text-muted)]">
        {formatTimeAgo(run.createdAt)}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-1">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
