import { ArrowLeft, Loader2, UserPlus, Check } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";
import type { Lead } from "@/shared/types/lead";

interface PreviewStepProps {
  leads: Lead[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  onBack: () => void;
  onCreate: () => void;
  isCreating: boolean;
}

export function PreviewStep({
  leads,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  onBack,
  onCreate,
  isCreating,
}: PreviewStepProps) {
  const allSelected = selectedIds.size === leads.length;
  const noneSelected = selectedIds.size === 0;
  const selectedCount = selectedIds.size;

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Sélectionnez les leads à importer dans votre base de données.
      </p>

      {/* Select all header */}
      <div className="flex items-center gap-3 pb-2 border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={onToggleAll}
          className="flex items-center justify-center w-5 h-5 rounded border border-[var(--color-border)] bg-[var(--color-background)] transition-colors hover:border-[var(--color-primary)]"
          disabled={isCreating}
        >
          {allSelected && (
            <Check className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          )}
          {!allSelected && !noneSelected && (
            <div className="w-2 h-0.5 bg-[var(--color-primary)]" />
          )}
        </button>
        <span className="text-sm text-[var(--color-text-muted)]">
          {allSelected
            ? "Tout désélectionner"
            : noneSelected
              ? "Tout sélectionner"
              : `${selectedCount} sélectionné${selectedCount > 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Lead list */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {leads.map((lead) => {
          const isSelected = selectedIds.has(lead.id);
          const subscriber = lead.subscriber;
          const fullName = [subscriber.prenom, subscriber.nom]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={lead.id}
              type="button"
              onClick={() => onToggleSelection(lead.id)}
              disabled={isCreating}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-left transition-colors ${
                isSelected
                  ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30"
                  : "bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <div
                className={`flex items-center justify-center w-5 h-5 rounded border transition-colors ${
                  isSelected
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-background)]"
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[var(--color-text-primary)] truncate">
                    {fullName || "Sans nom"}
                  </span>
                  {subscriber.dateNaissance && (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {subscriber.dateNaissance as string}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  {subscriber.codePostal && (
                    <span>{subscriber.codePostal as string}</span>
                  )}
                  {subscriber.email && (
                    <>
                      <span>•</span>
                      <span className="truncate">{subscriber.email as string}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack} disabled={isCreating}>
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button onClick={onCreate} disabled={noneSelected || isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Créer {selectedCount} lead{selectedCount > 1 ? "s" : ""}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
