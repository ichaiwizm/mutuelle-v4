import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SlideOverSectionProps {
  title?: string
  children: ReactNode
  className?: string
}

export function SlideOverSection({ title, children, className }: SlideOverSectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
