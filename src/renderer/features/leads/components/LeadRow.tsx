import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button, TableRow, TableCell } from '@/renderer/components/ui'
import type { LeadWithMeta } from '../types'
import { formatTimeAgo } from '@/renderer/lib/formatters'

interface LeadRowProps {
  lead: LeadWithMeta
  index: number
  onView: (lead: LeadWithMeta) => void
  onEdit: (lead: LeadWithMeta) => void
  onDelete: (lead: LeadWithMeta) => void
}

export function LeadRow({ lead, index, onView, onEdit, onDelete }: LeadRowProps) {
  const { subscriber } = lead

  // Full name
  const fullName = [subscriber.prenom, subscriber.nom].filter(Boolean).join(' ') || '—'

  // Format date
  const timeAgo = formatTimeAgo(lead.createdAt)

  return (
    <TableRow index={index}>
      {/* Name */}
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="text-[var(--color-text-primary)]">{fullName}</span>
          {subscriber.civilite && (
            <span className="text-xs text-[var(--color-text-muted)]">
              {subscriber.civilite}
            </span>
          )}
        </div>
      </TableCell>

      {/* Email */}
      <TableCell>
        <span className="text-[var(--color-text-secondary)]">
          {subscriber.email || '—'}
        </span>
      </TableCell>

      {/* Phone */}
      <TableCell>
        <span className="text-[var(--color-text-secondary)] font-mono text-sm">
          {subscriber.telephone || '—'}
        </span>
      </TableCell>

      {/* City */}
      <TableCell>
        <span className="text-[var(--color-text-secondary)]">
          {subscriber.ville || '—'}
        </span>
      </TableCell>

      {/* Created */}
      <TableCell>
        <span className="text-sm text-[var(--color-text-muted)]">{timeAgo}</span>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(lead)}
            className="h-8 w-8 p-0"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(lead)}
            className="h-8 w-8 p-0"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(lead)}
            className="h-8 w-8 p-0 text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-muted)]"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
