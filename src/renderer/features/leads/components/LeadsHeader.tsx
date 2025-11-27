import { Plus } from 'lucide-react'
import { Button, SearchInput } from '@/renderer/components/ui'

interface LeadsHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onCreateClick: () => void
  totalLeads: number
}

export function LeadsHeader({
  searchQuery,
  onSearchChange,
  onCreateClick,
  totalLeads,
}: LeadsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] font-display">
          Leads
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {totalLeads} {totalLeads === 1 ? 'lead' : 'leads'} in total
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <SearchInput
          value={searchQuery}
          onValueChange={onSearchChange}
          placeholder="Search leads..."
          className="w-64"
        />

        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>
    </div>
  )
}
