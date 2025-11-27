import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SlideOverDataRowProps {
  label: ReactNode
  value: ReactNode
  className?: string
}

export function SlideOverDataRow({ label, value, className }: SlideOverDataRowProps) {
  return (
    <div className={cn('flex items-baseline justify-between py-2', className)}>
      <dt className="text-sm text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--color-text-primary)] text-right max-w-[60%]">
        {value || <span className="text-[var(--color-text-muted)]">—</span>}
      </dd>
    </div>
  )
}
