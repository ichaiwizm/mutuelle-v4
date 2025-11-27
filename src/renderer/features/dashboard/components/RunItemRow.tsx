import { CheckCircle2, XCircle, Clock, Loader2, Folder } from 'lucide-react'
import { Button } from '@/renderer/components/ui'
import { cn } from '@/lib/utils'
import type { RunItem } from '@/shared/types/run'

interface RunItemRowProps {
  item: RunItem
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'done':
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
    case 'failed':
    case 'error':
      return <XCircle className="h-4 w-4 text-[var(--color-error)]" />
    case 'running':
      return <Loader2 className="h-4 w-4 text-[var(--color-info)] animate-spin" />
    default:
      return <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
  }
}

function getStatusClasses(status: string) {
  if (['done', 'completed'].includes(status)) return 'bg-[var(--color-success-muted)] text-[var(--color-success)]'
  if (['failed', 'error'].includes(status)) return 'bg-[var(--color-error-muted)] text-[var(--color-error)]'
  return 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
}

export function RunItemRow({ item }: RunItemRowProps) {
  return (
    <div className={cn(
      'flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3',
      'hover:bg-[var(--color-surface-hover)] transition-colors'
    )}>
      <div className="flex items-center gap-3">
        {getStatusIcon(item.status)}
        <div>
          <p className="text-sm font-medium">{item.flowKey}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Lead: {item.leadId.slice(0, 8)}...</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusClasses(item.status))}>
          {item.status}
        </span>
        {item.artifactsDir && (
          <Button variant="ghost" size="sm" onClick={() => console.log('Artifacts:', item.artifactsDir)} title="View artifacts">
            <Folder className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
