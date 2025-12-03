import { GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepInfo } from "@/shared/data/products";

const STEP_TYPE_STYLES: Record<
  string,
  { border: string; badge: string; label: string }
> = {
  auth: {
    border: "border-l-blue-500",
    badge: "bg-blue-500/15 text-blue-400 ring-blue-500/20",
    label: "auth",
  },
  navigation: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
    label: "nav",
  },
  "form-fill": {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
    label: "form",
  },
  validation: {
    border: "border-l-cyan-500",
    badge: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/20",
    label: "valid",
  },
  submission: {
    border: "border-l-purple-500",
    badge: "bg-purple-500/15 text-purple-400 ring-purple-500/20",
    label: "submit",
  },
};

interface StepRowProps {
  step: StepInfo;
  index: number;
  isLast?: boolean;
}

export function StepRow({ step, index, isLast }: StepRowProps) {
  const typeStyle = STEP_TYPE_STYLES[step.type] || STEP_TYPE_STYLES["form-fill"];

  return (
    <div
      className={cn(
        "group flex items-center gap-3 py-2.5 px-3 border-l-2 transition-colors",
        typeStyle.border,
        "hover:bg-[var(--color-surface-hover)]",
        !isLast && "border-b border-b-[var(--color-border)]/50"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Step Number */}
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-mono font-medium shrink-0">
        {index + 1}
      </div>

      {/* Step Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {step.name}
          </span>
          {step.conditional && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/15 text-orange-400 ring-1 ring-inset ring-orange-500/20">
              <GitBranch className="w-2.5 h-2.5" />
              {step.conditional}
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--color-text-muted)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          {step.id}
        </span>
      </div>

      {/* Type Badge */}
      <span
        className={cn(
          "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset shrink-0",
          typeStyle.badge
        )}
      >
        {typeStyle.label}
      </span>
    </div>
  );
}
