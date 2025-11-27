import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogHeader } from '@/renderer/components/ui/Dialog'
import { useEscapeKey } from '@/renderer/hooks'
import { LeadForm } from './LeadForm'
import type { Lead } from '@/shared/types/lead'
import type { LeadWithMeta } from '../types'

interface LeadFormModalProps {
  open: boolean
  onClose: () => void
  lead?: LeadWithMeta | null
  onSuccess: () => void
}

export function LeadFormModal({ open, onClose, lead, onSuccess }: LeadFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!lead

  useEscapeKey(onClose, open && !isSubmitting)

  const handleSubmit = async (data: Lead) => {
    setIsSubmitting(true)
    try {
      if (isEditing && lead) {
        await window.api.leads.update(lead.id, {
          subscriber: data.subscriber,
          project: data.project,
          children: data.children,
        })
        toast.success('Lead updated successfully')
      } else {
        const result = await window.api.leads.create(data)
        if (result.duplicate) {
          toast.warning('A lead with this ID already exists')
        } else {
          toast.success('Lead created successfully')
        }
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to save lead:', error)
      toast.error(isEditing ? 'Failed to update lead' : 'Failed to create lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="2xl">
      <DialogHeader title={isEditing ? 'Edit Lead' : 'Create New Lead'} onClose={onClose} disabled={isSubmitting} />
      <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-6 py-4">
        <LeadForm initialData={lead || undefined} onSubmit={handleSubmit} onCancel={onClose} isSubmitting={isSubmitting} />
      </div>
    </Dialog>
  )
}
