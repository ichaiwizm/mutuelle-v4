import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/renderer/components/ui'
import { Dialog } from '@/renderer/components/ui/Dialog'
import { useEscapeKey } from '@/renderer/hooks'
import type { LeadWithMeta } from '../types'

interface DeleteConfirmDialogProps {
  lead: LeadWithMeta | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteConfirmDialog({ lead, open, onClose, onSuccess }: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  useEscapeKey(onClose, open && !isDeleting)

  if (!lead) return null

  const leadName = [lead.subscriber.prenom, lead.subscriber.nom].filter(Boolean).join(' ') || 'this lead'

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await window.api.leads.remove(lead.id)
      toast.success('Lead deleted successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to delete lead:', error)
      toast.error('Failed to delete lead')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="p-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-error-muted)]">
          <AlertTriangle className="h-6 w-6 text-[var(--color-error)]" />
        </div>
        <h2 className="text-center text-lg font-semibold text-[var(--color-text-primary)] font-display">
          Delete Lead
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
          Are you sure you want to delete <strong className="text-[var(--color-text-primary)]">{leadName}</strong>?
          This action cannot be undone.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting} className="min-w-[100px]">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting} className="min-w-[100px]">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
