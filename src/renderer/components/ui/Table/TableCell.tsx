import { forwardRef, type TdHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          'px-4 py-3 align-middle text-[var(--color-text-primary)]',
          '[&:has([role=checkbox])]:pr-0',
          className
        )}
        {...props}
      />
    )
  }
)

TableCell.displayName = 'TableCell'
