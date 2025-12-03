import { StopCircle } from "lucide-react";
import { Select } from "@/renderer/components/ui/Select";
import type { StepInfo } from "@/shared/data/products";

interface StopAtStepSelectProps {
  steps: StepInfo[];
  value: string | null;
  onChange: (stepId: string | null) => void;
  disabled?: boolean;
}

export function StopAtStepSelect({
  steps,
  value,
  onChange,
  disabled,
}: StopAtStepSelectProps) {
  const options = [
    { value: "", label: "Exécuter jusqu'à la fin" },
    ...steps.map((step, idx) => ({
      value: step.id,
      label: `${idx + 1}. ${step.name}`,
    })),
  ];

  return (
    <div className="py-3 px-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400">
          <StopCircle className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Point d'arrêt
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Arrêter l'exécution après cette étape
          </p>
        </div>
      </div>

      <Select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        options={options}
        disabled={disabled}
        size="sm"
      />
    </div>
  );
}
