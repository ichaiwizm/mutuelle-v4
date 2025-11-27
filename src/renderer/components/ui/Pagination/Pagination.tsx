import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePagination } from './usePagination'
import { PaginationButton } from './PaginationButton'
import { PageNumbers } from './PageNumbers'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const { getPageNumbers } = usePagination(currentPage, totalPages)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  if (totalPages <= 1) {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <p className="text-sm text-[var(--color-text-muted)]">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <p className="text-sm text-[var(--color-text-muted)]">
        {startItem}–{endItem} of {totalItems}
      </p>

      <div className="flex items-center gap-1">
        <PaginationButton onClick={() => onPageChange(1)} disabled={currentPage === 1} srLabel="First page">
          <ChevronsLeft className="h-4 w-4" />
        </PaginationButton>

        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          srLabel="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </PaginationButton>

        <PageNumbers pages={getPageNumbers()} currentPage={currentPage} onPageChange={onPageChange} />

        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          srLabel="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </PaginationButton>

        <PaginationButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          srLabel="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </PaginationButton>
      </div>
    </div>
  )
}
