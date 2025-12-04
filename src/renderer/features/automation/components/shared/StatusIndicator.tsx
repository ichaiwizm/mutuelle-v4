import { cn } from '@/lib/utils'

type Status = 'queued' | 'running' | 'done' | 'failed' | 'cancelled' | 'paused' | 'waiting_user'

interface StatusIndicatorProps {
  status: Status
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const STATUS_CONFIG: Record<Status, { color: string; bgColor: string; label: string; pulse?: boolean }> = {
  queued: {
    color: 'bg-blue-400',
    bgColor: 'bg-blue-400/20',
    label: 'Queued',
  },
  running: {
    color: 'bg-purple-400',
    bgColor: 'bg-purple-400/20',
    label: 'Running',
    pulse: true,
  },
  done: {
    color: 'bg-green-400',
    bgColor: 'bg-green-400/20',
    label: 'Done',
  },
  failed: {
    color: 'bg-red-400',
    bgColor: 'bg-red-400/20',
    label: 'Failed',
  },
  cancelled: {
    color: 'bg-zinc-400',
    bgColor: 'bg-zinc-400/20',
    label: 'Cancelled',
  },
  paused: {
    color: 'bg-amber-400',
    bgColor: 'bg-amber-400/20',
    label: 'Paused',
  },
  waiting_user: {
    color: 'bg-orange-400',
    bgColor: 'bg-orange-400/20',
    label: 'En attente',
    pulse: true,
  },
}

const SIZES = {
  sm: { dot: 'h-1.5 w-1.5', ring: 'h-3 w-3', badge: 'text-[10px] px-1.5 py-0.5' },
  md: { dot: 'h-2 w-2', ring: 'h-4 w-4', badge: 'text-xs px-2 py-0.5' },
  lg: { dot: 'h-2.5 w-2.5', ring: 'h-5 w-5', badge: 'text-sm px-2.5 py-1' },
}

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = false,
  className,
}: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.queued
  const sizeConfig = SIZES[size]

  if (showLabel) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium',
          config.bgColor,
          sizeConfig.badge,
          className
        )}
      >
        <span
          className={cn(
            'rounded-full',
            config.color,
            sizeConfig.dot,
            config.pulse && 'animate-pulse'
          )}
        />
        <span className={cn(
          status === 'done' && 'text-green-400',
          status === 'failed' && 'text-red-400',
          status === 'running' && 'text-purple-400',
          status === 'queued' && 'text-blue-400',
          status === 'cancelled' && 'text-zinc-400',
          status === 'paused' && 'text-amber-400',
          status === 'waiting_user' && 'text-orange-400',
        )}>
          {config.label}
        </span>
      </span>
    )
  }

  return (
    <div className={cn('relative flex items-center justify-center', sizeConfig.ring, className)}>
      {/* Pulsing ring for running status */}
      {config.pulse && (
        <span
          className={cn(
            'absolute inset-0 rounded-full opacity-75 animate-ping',
            config.color
          )}
          style={{ animationDuration: '1.5s' }}
        />
      )}
      {/* Main dot */}
      <span
        className={cn(
          'relative rounded-full',
          config.color,
          sizeConfig.dot
        )}
      />
    </div>
  )
}

/**
 * Get status badge classes for inline use
 */
export function getStatusClasses(status: string): string {
  switch (status) {
    case 'done':
    case 'completed':
      return 'bg-green-400/20 text-green-400'
    case 'failed':
    case 'error':
      return 'bg-red-400/20 text-red-400'
    case 'running':
      return 'bg-purple-400/20 text-purple-400'
    case 'queued':
      return 'bg-blue-400/20 text-blue-400'
    case 'cancelled':
      return 'bg-zinc-400/20 text-zinc-400'
    case 'paused':
      return 'bg-amber-400/20 text-amber-400'
    case 'waiting_user':
      return 'bg-orange-400/20 text-orange-400'
    default:
      return 'bg-zinc-400/20 text-zinc-400'
  }
}
