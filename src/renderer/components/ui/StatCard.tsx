import { cn } from '@/lib/utils'
import { Card } from './Card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
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
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  action,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className="h-4 w-4 text-[var(--color-text-muted)]" />
            )}
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              {title}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">
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
