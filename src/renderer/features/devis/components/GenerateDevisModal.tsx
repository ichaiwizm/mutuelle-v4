import { AlertCircle } from "lucide-react";
import { Modal, ModalHeader } from "@/renderer/components/ui/Modal";
import { Button } from "@/renderer/components/ui/Button";

interface GenerateDevisModalProps {
  open: boolean;
  onClose: () => void;
  leadName?: string;
}

/**
 * Modal for generating a new devis
 * Currently disabled - buttons are greyed out until flow integration
 */
export function GenerateDevisModal({ open, onClose, leadName }: GenerateDevisModalProps) {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalHeader title="Générer un devis" onClose={onClose} />

      <div className="p-4 space-y-4">
        {leadName && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Pour le lead: <span className="font-medium text-[var(--color-text-primary)]">{leadName}</span>
          </p>
        )}

        {/* Disabled notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Fonctionnalité en cours de développement
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              La génération de devis sera disponible une fois l'intégration avec les flows d'automation terminée.
              Pour le moment, les devis sont créés automatiquement lors de l'exécution des flows.
            </p>
          </div>
        </div>

        {/* Placeholder product selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">
            Sélectionner un produit
          </label>
          <select
            className="w-full h-10 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm opacity-50 cursor-not-allowed"
            disabled
          >
            <option>Alptis - Santé Select</option>
            <option>Alptis - Santé Pro Plus</option>
            <option>SwissLife - SLSIS</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button disabled>
            Générer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
