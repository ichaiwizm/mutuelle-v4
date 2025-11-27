import { Users } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  EmptyState,
  EmptyStateIllustration,
} from '@/renderer/components/ui'
import { LeadRow } from './LeadRow'
import type { LeadWithMeta } from '../types'

interface LeadsTableProps {
  leads: LeadWithMeta[]
  searchQuery: string
  onView: (lead: LeadWithMeta) => void
  onEdit: (lead: LeadWithMeta) => void
  onDelete: (lead: LeadWithMeta) => void
  onCreateClick: () => void
}

export function LeadsTable({
  leads,
  searchQuery,
  onView,
  onEdit,
  onDelete,
  onCreateClick,
}: LeadsTableProps) {
  // Empty states
  if (leads.length === 0) {
    if (searchQuery) {
      return (
        <EmptyState
          icon={<EmptyStateIllustration type="search" />}
          title="No results found"
          description={`No leads match "${searchQuery}". Try a different search term.`}
        />
      )
    }

    return (
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="No leads yet"
        description="Start by adding your first lead or fetching emails from Gmail."
        action={{
          label: 'Add Lead',
          onClick: onCreateClick,
        }}
      />
    )
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <Table>
        <TableHeader>
          <tr>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[200px]">Email</TableHead>
            <TableHead className="w-[140px]">Phone</TableHead>
            <TableHead className="w-[120px]">City</TableHead>
            <TableHead className="w-[100px]">Created</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {leads.map((lead, index) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              index={index}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
