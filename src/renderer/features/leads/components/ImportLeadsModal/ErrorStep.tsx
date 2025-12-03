import { AlertTriangle, RotateCcw, UserPlus } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";

interface ErrorStepProps {
  onRetry: () => void;
  onManualForm: () => void;
}

export function ErrorStep({ onRetry, onManualForm }: ErrorStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center py-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-warning-muted)] mb-4">
          <AlertTriangle className="h-6 w-6 text-[var(--color-warning)]" />
        </div>

        <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
          Format non reconnu
        </h3>

        <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
          Le texte coll\u00e9 ne correspond pas aux formats d'emails support\u00e9s.
        </p>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Formats support\u00e9s
        </p>
        <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
            AssurProspect (emails et transferts)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
            Assurland (emails avec tableaux)
          </li>
        </ul>
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="secondary" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" />
          R\u00e9essayer
        </Button>
        <Button onClick={onManualForm}>
          <UserPlus className="h-4 w-4" />
          Cr\u00e9er manuellement
        </Button>
      </div>
    </div>
  );
}
