import { forwardRef, type ThHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'h-11 px-4 text-left align-middle font-medium text-[var(--color-text-muted)]',
          'text-xs uppercase tracking-wider',
          '[&:has([role=checkbox])]:pr-0',
          className
        )}
        {...props}
      />
    )
  }
)

TableHead.displayName = 'TableHead'
