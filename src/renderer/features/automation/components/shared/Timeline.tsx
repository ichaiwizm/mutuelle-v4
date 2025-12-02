import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock, Loader2, Pause } from 'lucide-react'

type TimelineStatus = 'completed' | 'failed' | 'running' | 'pending' | 'paused'

interface TimelineItemProps {
  title: string
  description?: string
  status: TimelineStatus
  timestamp?: string
  isLast?: boolean
  action?: React.ReactNode
}

function getStatusIcon(status: TimelineStatus) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-400" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-400" />
    case 'running':
      return <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
    case 'paused':
      return <Pause className="h-4 w-4 text-amber-400" />
    default:
      return <Clock className="h-4 w-4 text-zinc-500" />
  }
}

function getStatusColor(status: TimelineStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-400'
    case 'failed':
      return 'bg-red-400'
    case 'running':
      return 'bg-purple-400'
    case 'paused':
      return 'bg-amber-400'
    default:
      return 'bg-zinc-600'
  }
}

export function TimelineItem({ title, description, status, timestamp, isLast, action }: TimelineItemProps) {
  return (
    <div className="relative flex gap-4">
      {/* Line connector */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-[11px] top-6 w-0.5 h-[calc(100%-8px)]',
            status === 'completed' ? 'bg-green-400/30' : 'bg-[var(--color-border)]'
          )}
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-6 w-6 items-center justify-center rounded-full',
          'bg-[var(--color-surface)] border-2',
          status === 'completed' && 'border-green-400/50',
          status === 'failed' && 'border-red-400/50',
          status === 'running' && 'border-purple-400/50',
          status === 'paused' && 'border-amber-400/50',
          status === 'pending' && 'border-[var(--color-border)]'
        )}
      >
        {getStatusIcon(status)}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center justify-between">
          <h4
            className={cn(
              'text-sm font-medium',
              status === 'pending'
                ? 'text-[var(--color-text-muted)]'
                : 'text-[var(--color-text-primary)]'
            )}
          >
            {title}
          </h4>
          <div className="flex items-center gap-2">
            {timestamp && (
              <span className="text-xs text-[var(--color-text-muted)]">{timestamp}</span>
            )}
            {action}
          </div>
        </div>
        {description && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
    </div>
  )
}

interface TimelineProps {
  children: React.ReactNode
  className?: string
}

export function Timeline({ children, className }: TimelineProps) {
  return <div className={cn('space-y-0', className)}>{children}</div>
}
