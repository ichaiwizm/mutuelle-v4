import { Send, Hand } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/renderer/components/ui";

interface AutoSubmitToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function AutoSubmitToggle({ checked, onChange, disabled }: AutoSubmitToggleProps) {
  const autoSubmit = checked;

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
            autoSubmit
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              : "bg-amber-500/10 text-amber-400"
          )}
        >
          {autoSubmit ? (
            <Send className="w-4 h-4" />
          ) : (
            <Hand className="w-4 h-4" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Soumission automatique
            </p>
            <InfoTooltip
              content="Désactivez pour arrêter l'exécution avant la soumission finale. Vous pourrez alors vérifier et soumettre manuellement le formulaire."
              side="right"
            />
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            {autoSubmit ? "Exécuter jusqu'à la fin" : "S'arrêter pour reprise manuelle"}
          </p>
        </div>
      </div>

      {/* Custom Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={autoSubmit}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          autoSubmit
            ? "bg-[var(--color-primary)]"
            : "bg-amber-500"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
            autoSubmit ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
