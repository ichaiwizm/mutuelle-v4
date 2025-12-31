import { useState, useMemo } from 'react';
import { useLeads, type LeadType } from '../hooks/useLeads';
import { LoadingSpinner, ErrorDisplay, PageHeader } from '../components/common';
import { LeadFilters, LeadTable, LeadDetailPanel } from '../components/leads';

export function LeadsPage() {
  const { leads, loading, error } = useLeads();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<LeadType | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = !search || lead.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || lead.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [leads, search, typeFilter]);

  const selectedLeadData = leads.find((l) => l.id === selectedLead);

  if (loading) return <LoadingSpinner message="Loading leads..." />;
  if (error) return <ErrorDisplay title="Failed to load leads" message={error} />;

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader title="Leads" description="Test leads for flow automation" />
        <LeadFilters
          search={search}
          typeFilter={typeFilter}
          resultCount={filteredLeads.length}
          onSearchChange={setSearch}
          onTypeFilterChange={setTypeFilter}
        />
        <div className="flex-1 overflow-y-auto px-8 py-4">
          <LeadTable leads={filteredLeads} selectedLead={selectedLead} onSelectLead={setSelectedLead} />
        </div>
      </div>
      {selectedLeadData && <LeadDetailPanel lead={selectedLeadData} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}
