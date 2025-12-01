import { useCallback, useMemo } from 'react'
import { Search, Filter, Calendar, X } from 'lucide-react'
import { Select } from '@/renderer/components/ui/Select'
import { Button } from '@/renderer/components/ui/Button'
import type { RunFilters as RunFiltersType, RunStatus, DateRangeFilter } from '../../types'

interface RunFiltersProps {
  filters: RunFiltersType
  onFiltersChange: (filters: Partial<RunFiltersType>) => void
}

const STATUS_OPTIONS: { value: RunStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'queued', label: 'En attente' },
  { value: 'running', label: 'En cours' },
  { value: 'done', label: 'Terminé' },
  { value: 'failed', label: 'Échoué' },
  { value: 'cancelled', label: 'Annulé' },
]

const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: 'all', label: 'Toutes les dates' },
  { value: 'today', label: "Aujourd'hui" },
  { value: '7days', label: '7 derniers jours' },
  { value: '30days', label: '30 derniers jours' },
]

const DEFAULT_FILTERS: RunFiltersType = {
  search: '',
  status: 'all',
  dateRange: 'all',
  productKey: 'all',
}

export function RunFilters({ filters, onFiltersChange }: RunFiltersProps) {
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.status !== 'all' ||
      filters.dateRange !== 'all' ||
      filters.productKey !== 'all'
    )
  }, [filters])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search !== '') count++
    if (filters.status !== 'all') count++
    if (filters.dateRange !== 'all') count++
    if (filters.productKey !== 'all') count++
    return count
  }, [filters])

  // Clear all filters
  const handleClearAll = useCallback(() => {
    onFiltersChange(DEFAULT_FILTERS)
  }, [onFiltersChange])

  return (
    <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
      {/* Search - extended placeholder */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="w-full h-9 pl-9 pr-3 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
        />
        {/* Clear search button */}
        {filters.search && (
          <button
            type="button"
            onClick={() => onFiltersChange({ search: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-[var(--color-text-muted)]" />
        <Select
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value as RunStatus | 'all' })}
          options={STATUS_OPTIONS}
          className="w-40"
        />
      </div>

      {/* Date range filter */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[var(--color-text-muted)]" />
        <Select
          value={filters.dateRange}
          onChange={(e) => onFiltersChange({ dateRange: e.target.value as DateRangeFilter })}
          options={DATE_RANGE_OPTIONS}
          className="w-44"
        />
      </div>

      {/* Clear All button - visible when filters are active */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shrink-0"
        >
          <X className="h-4 w-4 mr-1" />
          Clear{activeFilterCount > 1 && ` (${activeFilterCount})`}
        </Button>
      )}
    </div>
  )
}
