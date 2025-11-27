import { Button } from '@/renderer/components/ui'

interface FormActionsProps {
  onCancel: () => void
  isSubmitting?: boolean
  isEditing: boolean
}

export function FormActions({ onCancel, isSubmitting, isEditing }: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
      <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Lead'}
      </Button>
    </div>
  )
}
