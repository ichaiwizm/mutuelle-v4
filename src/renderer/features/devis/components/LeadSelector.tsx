import { useState, useEffect } from "react";
import { Search, Users, FileText, ChevronRight } from "lucide-react";
import { Card } from "@/renderer/components/ui/Card";
import { Input } from "@/renderer/components/ui/Input";
import { Skeleton } from "@/renderer/components/ui/Skeleton";
import { EmptyState } from "@/renderer/components/ui/EmptyState";
import type { Lead } from "@/shared/types/lead";

interface LeadWithDevisCount {
  id: string;
  lead: Lead;
  createdAt: Date;
  devisCount: number;
}

interface LeadSelectorProps {
  onSelectLead: (leadId: string) => void;
}

/**
 * Parse a lead row to get the Lead object
 */
function parseLeadData(data: string): Lead {
  try {
    return JSON.parse(data) as Lead;
  } catch {
    return {
      id: "",
      subscriber: { nom: "[Données corrompues]", prenom: "" },
    };
  }
}

/**
 * Get display name from lead
 */
function getLeadName(lead: Lead): string {
  const { prenom, nom } = lead.subscriber;
  if (prenom && nom) {
    return `${prenom} ${String(nom).toUpperCase()}`;
  }
  return String(nom || prenom || "Inconnu");
}

/**
 * Component for selecting a lead to view its devis
 */
export function LeadSelector({ onSelectLead }: LeadSelectorProps) {
  const [leads, setLeads] = useState<LeadWithDevisCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<Error | null>(null);

  // Load leads and their devis counts
  useEffect(() => {
    async function loadLeads() {
      console.log('[LEAD-SELECTOR] Loading leads...');
      setLoading(true);
      setError(null);

      try {
        // Fetch leads
        const result = await window.api.leads.list({ limit: 100 });
        const leadRows = result.leads;

        // Get devis counts for all leads
        const leadIds = leadRows.map((r) => r.id);
        const devisCounts = await window.api.devis.countByLead(leadIds);

        // Build lead list with counts
        const leadsWithCounts: LeadWithDevisCount[] = leadRows.map((row) => ({
          id: row.id,
          lead: parseLeadData(row.data),
          createdAt: row.createdAt,
          devisCount: devisCounts[row.id] || 0,
        }));

        // Sort by devis count (descending), then by date
        leadsWithCounts.sort((a, b) => {
          if (b.devisCount !== a.devisCount) {
            return b.devisCount - a.devisCount;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        console.log('[LEAD-SELECTOR] Loaded', leadsWithCounts.length, 'leads');
        setLeads(leadsWithCounts);
      } catch (err) {
        console.log('[LEAD-SELECTOR] Error loading leads:', err);
        setError(err instanceof Error ? err : new Error("Échec du chargement"));
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  // Filter leads by search and exclude leads without devis
  const filteredLeads = leads.filter((item) => {
    if (item.devisCount === 0) return false;
    if (!search) return true;
    const name = getLeadName(item.lead).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-[var(--color-border)]">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="Erreur de chargement"
        description={error.message}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
        <Input
          type="text"
          placeholder="Rechercher un lead..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lead list */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title={search ? "Aucun résultat" : "Aucun lead"}
          description={
            search
              ? "Aucun lead ne correspond à votre recherche."
              : "Importez des leads pour commencer à générer des devis."
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredLeads.map((item) => (
            <Card
              key={item.id}
              className="p-4 cursor-pointer hover:border-[var(--color-primary)] transition-colors"
              onClick={() => onSelectLead(item.id)}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-[var(--color-primary)]" />
                </div>

                {/* Lead info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{getLeadName(item.lead)}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {item.lead.subscriber.email || item.lead.subscriber.telephone || "-"}
                  </p>
                </div>

                {/* Devis count */}
                <div className="flex items-center gap-3">
                  {item.devisCount > 0 ? (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.devisCount}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--color-text-muted)]">Aucun devis</span>
                  )}
                  <ChevronRight className="h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
