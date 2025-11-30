import { cn } from '@/lib/utils'
import { Card } from './Card'
import type { LucideIcon } from 'lucide-react'

type StatVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
type StatSize = 'default' | 'compact'

interface StatCardProps {
  // Legacy props (title/value)
  title?: string
  value: number | string
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  action?: React.ReactNode
  className?: string
  // New props
  label?: string // Alias for title
  variant?: StatVariant
  size?: StatSize
  pulse?: boolean
}

const VARIANT_COLORS: Record<StatVariant, { text: string; bg: string }> = {
  default: { text: 'text-[var(--color-text-muted)]', bg: '' },
  primary: { text: 'text-purple-400', bg: 'bg-purple-400/10' },
  success: { text: 'text-green-400', bg: 'bg-green-400/10' },
  warning: { text: 'text-amber-400', bg: 'bg-amber-400/10' },
  error: { text: 'text-red-400', bg: 'bg-red-400/10' },
  info: { text: 'text-blue-400', bg: 'bg-blue-400/10' },
}

export function StatCard({
  title,
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  action,
  className,
  variant = 'default',
  size = 'default',
  pulse = false,
}: StatCardProps) {
  const displayTitle = label || title
  const colors = VARIANT_COLORS[variant]
  const isCompact = size === 'compact'

  if (isCompact) {
    return (
      <Card className={cn('p-3', colors.bg, className)}>
        <div className="text-center">
          <p className="text-xs font-medium text-[var(--color-text-muted)]">
            {displayTitle}
          </p>
          <p className={cn(
            'text-2xl font-semibold mt-1',
            colors.text,
            pulse && 'animate-pulse'
          )}>
            {value}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-4', colors.bg, className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className={cn('h-4 w-4', colors.text || 'text-[var(--color-text-muted)]')} />
            )}
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              {displayTitle}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn(
              'text-3xl font-semibold tracking-tight',
              colors.text,
              pulse && 'animate-pulse'
            )}>
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive
                    ? 'text-[var(--color-success)]'
                    : 'text-[var(--color-text-muted)]'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value} {trend.label}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </Card>
  )
}
