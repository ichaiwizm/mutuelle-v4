import { Monitor, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/renderer/components/ui";

interface HeadlessToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function HeadlessToggle({ checked, onChange, disabled }: HeadlessToggleProps) {
  const isHeadless = checked;

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
            isHeadless
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              : "bg-emerald-500/10 text-emerald-400"
          )}
        >
          {isHeadless ? (
            <Monitor className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Mode navigateur
            </p>
            <InfoTooltip
              content="En mode invisible, le navigateur fonctionne en arrière-plan. Activez le mode visible pour voir le formulaire se remplir (utile pour le debug)."
              side="right"
            />
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            {isHeadless ? "Invisible (headless)" : "Visible pour debug"}
          </p>
        </div>
      </div>

      {/* Custom Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={!isHeadless}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !isHeadless
            ? "bg-emerald-500"
            : "bg-[var(--color-border)]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
            !isHeadless ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
