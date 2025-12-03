import { Rocket, X } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";

interface SelectionActionBarProps {
  selectedCount: number;
  onSendToAutomation: () => void;
  onClearSelection: () => void;
}

export function SelectionActionBar({
  selectedCount,
  onSendToAutomation,
  onClearSelection,
}: SelectionActionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg shadow-lg">
        <span className="text-sm text-[var(--color-text-secondary)]">
          {selectedCount} lead{selectedCount > 1 ? "s" : ""} sélectionné
          {selectedCount > 1 ? "s" : ""}
        </span>
        <div className="w-px h-5 bg-[var(--color-border)]" />
        <Button size="sm" onClick={onSendToAutomation} className="gap-2">
          <Rocket className="h-4 w-4" />
          Envoyer à une automation
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          title="Désélectionner tout"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
