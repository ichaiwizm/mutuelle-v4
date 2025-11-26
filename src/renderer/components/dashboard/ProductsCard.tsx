import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "../common/StatusBadge";
import type { ProductConfiguration } from "@/shared/types/product";

type ProductsCardProps = {
  activeProducts: ProductConfiguration[];
  onViewConfig: () => void;
};

export function ProductsCard({ activeProducts, onViewConfig }: ProductsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BoxIcon />
          Produits actifs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-3xl font-bold">{activeProducts.length}</p>

        {activeProducts.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {activeProducts.map((p) => (
              <StatusBadge key={p.flowKey} variant="success">
                {p.displayName}
              </StatusBadge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Aucun produit actif
          </p>
        )}

        <button
          onClick={onViewConfig}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Gérer les produits →
        </button>
      </CardContent>
    </Card>
  );
}

function BoxIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}
