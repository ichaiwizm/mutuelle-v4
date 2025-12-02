import { useNavigate } from 'react-router-dom'
import { TableRow, TableCell } from '@/renderer/components/ui/Table'
import { Button } from '@/renderer/components/ui/Button'
import { XCircle, Loader2, Hash, Trash2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusIndicator } from '../shared/StatusIndicator'
import type { Run } from '@/shared/types/run'

interface RunRowProps {
  run: Run
  index: number
  isCancelling?: boolean
  isDeleting?: boolean
  isRetrying?: boolean
  onCancel: () => void
  onDelete: () => void
  onRetry: () => void
}

function formatTimeAgo(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `il y a ${diffMins}min`
  if (diffHours < 24) return `il y a ${diffHours}h`
  if (diffDays < 7) return `il y a ${diffDays}j`

  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatAbsoluteTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RunRow({ run, index, isCancelling, isDeleting, isRetrying, onCancel, onDelete, onRetry }: RunRowProps) {
  const navigate = useNavigate()
  const canCancel = run.status === 'running' || run.status === 'queued'
  const canRetry = run.status === 'failed' || run.status === 'cancelled'
  const canDelete = run.status === 'done' || run.status === 'failed' || run.status === 'cancelled'

  const handleViewRun = () => {
    navigate(`/automation/runs/${run.id}`)
  }

  return (
    <TableRow
      className="hover:bg-[var(--color-surface-hover)] animate-table-row-in cursor-pointer group"
      style={{ '--row-index': index } as React.CSSProperties}
      onClick={handleViewRun}
    >
      {/* Run info - ID badge */}
      <TableCell>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] w-fit">
          <Hash className="h-3 w-3" />
          <span className="font-mono text-xs">{run.id.slice(0, 8)}</span>
        </div>
      </TableCell>

      {/* Items count */}
      <TableCell>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {run.itemsCount ?? 0}
        </span>
      </TableCell>

      {/* Status - just the indicator, no redundant badge */}
      <TableCell>
        <StatusIndicator status={run.status as any} showLabel size="md" />
      </TableCell>

      {/* Created - relative with absolute tooltip */}
      <TableCell className="text-[var(--color-text-muted)] text-sm">
        <span title={formatAbsoluteTime(run.createdAt)}>
          {formatTimeAgo(run.createdAt)}
        </span>
      </TableCell>

      {/* Actions - fixed width, visually separated */}
      <TableCell>
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isCancelling}
              title={run.status === 'running' ? 'Arrêter' : 'Annuler'}
              className="h-8 w-8 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          )}
          {canRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              title="Relancer"
              className="h-8 w-8 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-info)] hover:bg-[var(--color-info)]/10"
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              title="Supprimer"
              className="h-8 w-8 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
          {/* Placeholder to maintain consistent width when no actions */}
          {!canCancel && !canRetry && !canDelete && (
            <div className="w-8 h-8" />
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
