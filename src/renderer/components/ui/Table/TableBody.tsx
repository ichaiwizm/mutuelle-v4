import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  }
)

TableBody.displayName = 'TableBody'
