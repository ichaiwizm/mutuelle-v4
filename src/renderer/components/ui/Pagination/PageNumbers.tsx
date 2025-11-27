import { cn } from '@/lib/utils'
import { Button } from '../Button'

interface PageNumbersProps {
  pages: (number | 'ellipsis')[]
  currentPage: number
  onPageChange: (page: number) => void
}

export function PageNumbers({ pages, currentPage, onPageChange }: PageNumbersProps) {
  return (
    <div className="flex items-center gap-0.5 mx-1">
      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="w-8 text-center text-[var(--color-text-muted)]">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(page)}
            className={cn('h-8 w-8 p-0 text-xs', page === currentPage && 'pointer-events-none')}
          >
            {page}
          </Button>
        )
      )}
    </div>
  )
}
