import { Search, X } from "lucide-react";
import { Input } from "@/renderer/components/ui/Input";
import { Button } from "@/renderer/components/ui/Button";
import type { DevisFilters as DevisFiltersType, DevisStatus } from "@/shared/types/devis";

interface DevisFiltersProps {
  filters: DevisFiltersType;
  onFiltersChange: (filters: DevisFiltersType) => void;
  flowKeys?: string[];
}

const STATUS_OPTIONS: { value: DevisStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "completed", label: "Complété" },
  { value: "failed", label: "Échoué" },
  { value: "expired", label: "Expiré" },
];

/**
 * Filters bar for devis list
 */
export function DevisFilters({
  filters,
  onFiltersChange,
  flowKeys = [],
}: DevisFiltersProps) {
  const hasActiveFilters =
    filters.status || filters.flowKey || filters.dateFrom || filters.dateTo || filters.search;

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
      {/* Status filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-[var(--color-text-muted)]">Statut:</label>
        <select
          className="h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          value={filters.status || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: e.target.value as DevisStatus | undefined || undefined,
            })
          }
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product filter */}
      {flowKeys.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--color-text-muted)]">Produit:</label>
          <select
            className="h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={filters.flowKey || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                flowKey: e.target.value || undefined,
              })
            }
          >
            <option value="">Tous les produits</option>
            {flowKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date range */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-[var(--color-text-muted)]">Du:</label>
        <input
          type="date"
          className="h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          value={filters.dateFrom || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dateFrom: e.target.value || undefined,
            })
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-[var(--color-text-muted)]">Au:</label>
        <input
          type="date"
          className="h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          value={filters.dateTo || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dateTo: e.target.value || undefined,
            })
          }
        />
      </div>

      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            type="text"
            placeholder="Rechercher..."
            className="pl-9"
            value={filters.search || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                search: e.target.value || undefined,
              })
            }
          />
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Effacer
        </Button>
      )}
    </div>
  );
}
