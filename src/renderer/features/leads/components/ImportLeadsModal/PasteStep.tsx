import { ClipboardPaste, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";

interface PasteStepProps {
  text: string;
  onTextChange: (text: string) => void;
  onParse: () => void;
  onCancel: () => void;
  isParsing: boolean;
}

export function PasteStep({
  text,
  onTextChange,
  onParse,
  onCancel,
  isParsing,
}: PasteStepProps) {
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        onTextChange(clipboardText);
      }
    } catch (error) {
      console.error("Clipboard read error:", error);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Collez le contenu d'un email AssurProspect ou Assurland pour importer
        automatiquement les leads.
      </p>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Collez ici le contenu de l'email..."
          className="w-full h-48 px-4 py-3 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-lg)] resize-none transition-colors duration-[var(--transition-fast)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          disabled={isParsing}
        />

        {!text && (
          <button
            type="button"
            onClick={handlePaste}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            Coller
          </button>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isParsing}>
          Annuler
        </Button>
        <Button onClick={onParse} disabled={!text.trim() || isParsing}>
          {isParsing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyse...
            </>
          ) : (
            <>
              Analyser
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
