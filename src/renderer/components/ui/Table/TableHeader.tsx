import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('[&_tr]:border-b [&_tr]:border-[var(--color-border)]', className)}
        {...props}
      />
    )
  }
)

TableHeader.displayName = 'TableHeader'
