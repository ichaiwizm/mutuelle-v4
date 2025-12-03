import { Dialog, DialogHeader } from "@/renderer/components/ui/Dialog";
import { Button } from "@/renderer/components/ui/Button";

interface DeleteConfirmDialogProps {
  deleteConfirm: { id: string; name: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  deleteConfirm,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={!!deleteConfirm} onClose={onCancel} maxWidth="sm">
      <DialogHeader title="Supprimer le lead" onClose={onCancel} />
      <div className="px-6 py-4">
        <p className="text-[var(--color-text-secondary)]">
          Voulez-vous vraiment supprimer {deleteConfirm?.name} ?
        </p>
      </div>
      <div className="flex justify-end gap-3 p-4 border-t border-[var(--color-border)]">
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          variant="ghost"
          onClick={onConfirm}
          className="bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90"
        >
          Supprimer
        </Button>
      </div>
    </Dialog>
  );
}
