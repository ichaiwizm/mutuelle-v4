import { Search, Filter } from 'lucide-react'
import { Select } from '@/renderer/components/ui/Select'
import type { RunFilters as RunFiltersType, RunStatus } from '../../types'

interface RunFiltersProps {
  filters: RunFiltersType
  onFiltersChange: (filters: Partial<RunFiltersType>) => void
}

const STATUS_OPTIONS: { value: RunStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'queued', label: 'Queued' },
  { value: 'running', label: 'Running' },
  { value: 'done', label: 'Done' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function RunFilters({ filters, onFiltersChange }: RunFiltersProps) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search by ID..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="w-full h-9 pl-9 pr-3 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        />
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-[var(--color-text-muted)]" />
        <Select
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value as RunStatus | 'all' })}
          options={STATUS_OPTIONS}
          className="w-36"
        />
      </div>
    </div>
  )
}
