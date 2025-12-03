import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepInfo } from "@/shared/data/products";
import { StepRow } from "./StepRow";

interface StepsAccordionProps {
  steps: StepInfo[];
  defaultOpen?: boolean;
}

export function StepsAccordion({ steps, defaultOpen = false }: StepsAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      {/* Header Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between py-3 px-4",
          "bg-[var(--color-background)] hover:bg-[var(--color-surface-hover)]",
          "transition-colors",
          isOpen && "border-b border-[var(--color-border)]"
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Étapes du flow
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {steps.length} étape{steps.length > 1 ? "s" : ""} configurées
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--color-text-muted)] px-2 py-1 rounded bg-[var(--color-surface)]">
            {steps.filter((s) => s.conditional).length} conditionnelle{steps.filter((s) => s.conditional).length > 1 ? "s" : ""}
          </span>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Steps Content */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="bg-[var(--color-surface)]">
            {steps.map((step, index) => (
              <StepRow
                key={step.id}
                step={step}
                index={index}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
