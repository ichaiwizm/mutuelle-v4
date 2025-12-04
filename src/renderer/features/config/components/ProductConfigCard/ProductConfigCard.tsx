import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductInfo } from "@/shared/data/products";
import type { ProductSettings } from "../../types/automation";
import { HeadlessToggle } from "./HeadlessToggle";
import { AutoSubmitToggle } from "./AutoSubmitToggle";
import { StepsAccordion } from "./StepsAccordion";

const PLATFORM_STYLES: Record<
  string,
  { accent: string; accentBg: string; icon: string }
> = {
  alptis: {
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    icon: "🏔️",
  },
  swisslife: {
    accent: "text-rose-400",
    accentBg: "bg-rose-500/10",
    icon: "🔴",
  },
};

const COMPLEXITY_BADGES: Record<string, { label: string; class: string }> = {
  simple: { label: "Simple", class: "bg-emerald-500/15 text-emerald-400" },
  medium: { label: "Moyen", class: "bg-amber-500/15 text-amber-400" },
  complex: { label: "Complexe", class: "bg-rose-500/15 text-rose-400" },
};

interface ProductConfigCardProps {
  product: ProductInfo;
  settings: ProductSettings;
  onHeadlessChange: (headless: boolean) => void;
  onAutoSubmitChange: (autoSubmit: boolean) => void;
}

export function ProductConfigCard({
  product,
  settings,
  onHeadlessChange,
  onAutoSubmitChange,
}: ProductConfigCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const platformStyle = PLATFORM_STYLES[product.platform] || PLATFORM_STYLES.alptis;
  const complexityBadge = COMPLEXITY_BADGES[product.metadata?.complexity || "medium"];

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden animate-scale-in">
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-surface-hover)] transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4">
          {/* Platform Icon */}
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl text-2xl",
              platformStyle.accentBg
            )}
          >
            {platformStyle.icon}
          </div>

          {/* Product Info */}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                {product.displayName}
              </h3>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", complexityBadge.class)}>
                {complexityBadge.label}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              {product.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Steps Count Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-background)] border border-[var(--color-border)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              {product.steps.length} étapes
            </span>
          </div>

          {/* Expand/Collapse Icon */}
          <ChevronDown
            className={cn(
              "w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0 space-y-3 border-t border-[var(--color-border)]">
            {/* Headless Toggle */}
            <HeadlessToggle
              checked={settings.headless}
              onChange={onHeadlessChange}
            />

            {/* Auto Submit Toggle - Only visible when NOT headless */}
            {!settings.headless && (
              <AutoSubmitToggle
                checked={settings.autoSubmit}
                onChange={onAutoSubmitChange}
              />
            )}

            {/* Steps Accordion */}
            <StepsAccordion steps={product.steps} />
          </div>
        </div>
      </div>
    </div>
  );
}
