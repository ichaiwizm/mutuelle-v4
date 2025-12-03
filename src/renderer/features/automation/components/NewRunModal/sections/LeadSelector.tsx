import { Users, ChevronDown } from "lucide-react";
import { Card } from "@/renderer/components/ui/Card";
import { SearchInput } from "@/renderer/components/ui/SearchInput";
import { Skeleton } from "@/renderer/components/ui/Skeleton";
import type { Lead } from "@/shared/types/lead";
import { getLeadDisplayName, getLeadSubtitle } from "../utils";

interface LeadSelectorProps {
  leads: Lead[];
  loading: boolean;
  selectedLeads: Set<string>;
  toggleLead: (leadId: string) => void;
  toggleAllLeads: () => void;
  selectLastN: (n: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  quickSelectOptions: number[];
}

export function LeadSelector({
  leads,
  loading,
  selectedLeads,
  toggleLead,
  toggleAllLeads,
  selectLastN,
  searchQuery,
  setSearchQuery,
  quickSelectOptions,
}: LeadSelectorProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text-primary)]">Leads</h3>
          <span className="text-sm text-[var(--color-text-muted)]">
            ({selectedLeads.size} sélectionné{selectedLeads.size > 1 ? "s" : ""})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick select dropdown */}
          {quickSelectOptions.length > 0 && (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-2 py-1 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                Sélection rapide
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="absolute right-0 top-full mt-1 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[140px]">
                {quickSelectOptions.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => selectLastN(n)}
                    className="w-full px-3 py-1.5 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {n} derniers
                  </button>
                ))}
              </div>
            </div>
          )}
          {leads.length > 0 && (
            <button
              type="button"
              onClick={toggleAllLeads}
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              {selectedLeads.size === leads.length ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder="Rechercher un lead..."
        className="mb-4"
      />

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : leads.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
          {searchQuery ? `Aucun lead trouvé pour "${searchQuery}"` : "Aucun lead disponible"}
        </p>
      ) : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {leads.map((lead) => (
            <label
              key={lead.id}
              className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedLeads.has(lead.id)}
                onChange={() => toggleLead(lead.id)}
                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--color-text-primary)] truncate">
                  {getLeadDisplayName(lead)}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] truncate">
                  {getLeadSubtitle(lead)}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </Card>
  );
}
