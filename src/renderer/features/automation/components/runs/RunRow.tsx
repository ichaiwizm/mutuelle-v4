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
      {/* Run info - ID badge + items summary */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
            <Hash className="h-3 w-3" />
            <span className="font-mono text-xs">{run.id.slice(0, 8)}</span>
          </div>
          {run.itemsCount && run.itemsCount > 0 && (
            <span className="text-sm text-[var(--color-text-secondary)]">
              {run.itemsCount} tâche{run.itemsCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </TableCell>

      {/* Status with inline progress for running */}
      <TableCell>
        <div className="flex items-center gap-2">
          <StatusIndicator status={run.status as any} showLabel size="md" />
          {isRunning && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
              </span>
              <span className="text-xs text-cyan-400 font-medium">Live</span>
            </div>
          )}
        </div>
      </TableCell>

      {/* Items count - with progress indicator for running */}
      <TableCell>
        <div className="flex items-center gap-2">
          <span className={cn(
            "tabular-nums",
            run.status === 'running' ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
          )}>
            {run.itemsCount ?? '-'}
          </span>
        </div>
      </TableCell>

      {/* Created - relative with absolute tooltip */}
      <TableCell className="text-[var(--color-text-muted)]">
        <span title={formatAbsoluteTime(run.createdAt)}>
          {formatTimeAgo(run.createdAt)}
        </span>
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
              title={run.status === 'running' ? 'Arrêter' : 'Annuler'}
              className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
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
              title="Relancer les échoués"
              className="text-[var(--color-info)] hover:text-[var(--color-info)] hover:bg-[var(--color-info)]/10"
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
              className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
