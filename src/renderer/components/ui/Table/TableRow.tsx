import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  index?: number
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, index = 0, style, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        style={{ ...style, '--row-index': index } as React.CSSProperties}
        className={cn(
          'border-b border-[var(--color-border)] transition-colors duration-[var(--transition-fast)]',
          'hover:bg-[var(--color-surface-hover)]',
          'animate-table-row-in',
          className
        )}
        {...props}
      />
    )
  }
)

TableRow.displayName = 'TableRow'
