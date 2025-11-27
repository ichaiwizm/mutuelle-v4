import { cn } from '@/lib/utils'

export type Status = 'running' | 'queued' | 'done' | 'failed' | 'cancelled' | 'paused' | 'active' | 'inactive' | 'beta'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<
  Status,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  running: {
    label: 'Running',
    dotColor: 'bg-[var(--color-info)]',
    bgColor: 'bg-[var(--color-info-muted)]',
    textColor: 'text-[var(--color-info)]',
  },
  queued: {
    label: 'Queued',
    dotColor: 'bg-[var(--color-warning)]',
    bgColor: 'bg-[var(--color-warning-muted)]',
    textColor: 'text-[var(--color-warning)]',
  },
  done: {
    label: 'Done',
    dotColor: 'bg-[var(--color-success)]',
    bgColor: 'bg-[var(--color-success-muted)]',
    textColor: 'text-[var(--color-success)]',
  },
  failed: {
    label: 'Failed',
    dotColor: 'bg-[var(--color-error)]',
    bgColor: 'bg-[var(--color-error-muted)]',
    textColor: 'text-[var(--color-error)]',
  },
  cancelled: {
    label: 'Cancelled',
    dotColor: 'bg-[var(--color-text-muted)]',
    bgColor: 'bg-[var(--color-surface-hover)]',
    textColor: 'text-[var(--color-text-muted)]',
  },
  paused: {
    label: 'Paused',
    dotColor: 'bg-[var(--color-warning)]',
    bgColor: 'bg-[var(--color-warning-muted)]',
    textColor: 'text-[var(--color-warning)]',
  },
  active: {
    label: 'Active',
    dotColor: 'bg-[var(--color-success)]',
    bgColor: 'bg-[var(--color-success-muted)]',
    textColor: 'text-[var(--color-success)]',
  },
  inactive: {
    label: 'Inactive',
    dotColor: 'bg-[var(--color-text-muted)]',
    bgColor: 'bg-[var(--color-surface-hover)]',
    textColor: 'text-[var(--color-text-muted)]',
  },
  beta: {
    label: 'Beta',
    dotColor: 'bg-[var(--color-primary)]',
    bgColor: 'bg-[var(--color-primary)]/10',
    textColor: 'text-[var(--color-primary)]',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          config.dotColor,
          status === 'running' && 'animate-pulse'
        )}
      />
      {config.label}
    </span>
  )
}
