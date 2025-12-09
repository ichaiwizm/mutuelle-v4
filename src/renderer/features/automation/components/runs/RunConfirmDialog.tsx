import { Dialog, DialogHeader } from '@/renderer/components/ui/Dialog'
import { Button } from '@/renderer/components/ui/Button'

export type RunActionType = 'delete' | 'cancel'

interface RunConfirmDialogProps {
  action: RunActionType | null
  runId: string | null
  onConfirm: () => void
  onCancel: () => void
}

const actionConfig = {
  delete: {
    title: 'Supprimer l\'exécution',
    message: 'Voulez-vous vraiment supprimer cette exécution ? Cette action est irréversible.',
    confirmLabel: 'Supprimer',
  },
  cancel: {
    title: 'Annuler l\'exécution',
    message: 'Voulez-vous vraiment annuler cette exécution en cours ?',
    confirmLabel: 'Annuler l\'exécution',
  },
}

export function RunConfirmDialog({
  action,
  runId,
  onConfirm,
  onCancel,
}: RunConfirmDialogProps) {
  const config = action ? actionConfig[action] : null
  const isOpen = !!action && !!runId

  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="sm">
      {config && (
        <>
          <DialogHeader title={config.title} onClose={onCancel} />
          <div className="px-6 py-4">
            <p className="text-[var(--color-text-secondary)]">
              {config.message}
            </p>
          </div>
          <div className="flex justify-end gap-3 p-4 border-t border-[var(--color-border)]">
            <Button variant="secondary" onClick={onCancel}>
              Retour
            </Button>
            <Button
              variant="ghost"
              onClick={onConfirm}
              className="bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90"
            >
              {config.confirmLabel}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  )
}
