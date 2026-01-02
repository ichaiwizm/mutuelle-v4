import { Package } from "lucide-react";
import { Card } from "@/renderer/components/ui/Card";
import { Skeleton } from "@/renderer/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { getPlatformFromFlowKey } from "@/renderer/lib/credentials";
import type { ProductConfiguration } from "@/shared/types/product";

interface ProductSelectorProps {
  products: ProductConfiguration[];
  loading: boolean;
  selectedFlows: Set<string>;
  toggleFlow: (flowKey: string) => void;
  toggleAllFlows: () => void;
  configuredPlatforms: Set<string>;
}

export function ProductSelector({
  products,
  loading,
  selectedFlows,
  toggleFlow,
  toggleAllFlows,
  configuredPlatforms,
}: ProductSelectorProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text-primary)]">Produits</h3>
          <span className="text-sm text-[var(--color-text-muted)]">
            ({selectedFlows.size} sélectionné{selectedFlows.size > 1 ? "s" : ""})
          </span>
        </div>
        {products.length > 0 && (
          <button
            type="button"
            onClick={toggleAllFlows}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            {selectedFlows.size === products.length ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
          Aucun produit actif disponible
        </p>
      ) : (
        <div className="space-y-2">
          {products.map((product) => {
            const platform = getPlatformFromFlowKey(product.flowKey);
            const hasCredentials = platform ? configuredPlatforms.has(platform) : true;

            return (
              <label
                key={product.flowKey}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-[var(--radius-md)] border cursor-pointer transition-colors",
                  hasCredentials
                    ? "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                    : "border-[var(--color-warning)]/50 bg-[var(--color-warning)]/5"
                )}
                title={hasCredentials ? undefined : `Identifiants ${platform} non configurés`}
              >
                <input
                  type="checkbox"
                  checked={selectedFlows.has(product.flowKey)}
                  onChange={() => toggleFlow(product.flowKey)}
                  className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {product.displayName}
                    </span>
                    {!hasCredentials && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-warning)]/20 text-[var(--color-warning)]">
                        Config manquante
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {product.platform} - {product.category}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </Card>
  );
}
