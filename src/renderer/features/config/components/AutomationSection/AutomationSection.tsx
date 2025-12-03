import { Cpu, Info } from "lucide-react";
import { PRODUCTS } from "@/shared/data/products";
import { ProductConfigCard } from "../ProductConfigCard";
import { useProductSettings } from "../../hooks/useProductSettings";

export function AutomationSection() {
  const { getSettings, updateHeadless, updateStopAtStep } = useProductSettings();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Cpu className="h-5 w-5 text-[var(--color-text-muted)]" />
        <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
          Configuration des produits
        </h2>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-info-muted)] border border-[var(--color-info)]/20">
        <Info className="h-5 w-5 text-[var(--color-info)] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-[var(--color-info)]">Paramètres d'automatisation</h4>
          <p className="text-sm text-[var(--color-info)]/80 mt-0.5">
            Ces paramètres ne sont pas encore connectés au backend. Ils seront utilisés dans une prochaine version pour contrôler l'exécution des flows.
          </p>
        </div>
      </div>

      {/* Product Cards */}
      <div className="space-y-4">
        {PRODUCTS.map((product) => {
          const settings = getSettings(product.flowKey);

          return (
            <ProductConfigCard
              key={product.flowKey}
              product={product}
              settings={settings}
              onHeadlessChange={(headless) => updateHeadless(product.flowKey, headless)}
              onStopAtStepChange={(stepId) => updateStopAtStep(product.flowKey, stepId)}
            />
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="pt-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          Le mode <strong>visible</strong> permet de voir le navigateur pendant l'exécution, utile pour le debug.
          <br />
          L'option <strong>point d'arrêt</strong> permet de stopper l'exécution à une étape spécifique pour inspection manuelle.
        </p>
      </div>
    </div>
  );
}
