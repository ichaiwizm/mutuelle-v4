import type { ReactNode } from 'react';

export type LeadType = 'solo' | 'conjoint' | 'enfants' | 'famille';

export interface Lead {
  id: string;
  name: string;
  type: LeadType;
  data: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

interface LeadSelectorProps {
  leads: Lead[];
  selectedLeadId: string;
  onSelectLead: (leadId: string) => void;
  disabled?: boolean;
}

const typeLabels: Record<LeadType, string> = {
  solo: 'Solo',
  conjoint: 'Conjoint',
  enfants: 'Enfants',
  famille: 'Famille',
};

export function LeadSelector({
  leads,
  selectedLeadId,
  onSelectLead,
  disabled = false,
}: LeadSelectorProps): ReactNode {
  const groupedLeads = leads.reduce<Record<LeadType, Lead[]>>(
    (acc, lead) => {
      acc[lead.type].push(lead);
      return acc;
    },
    { solo: [], conjoint: [], enfants: [], famille: [] }
  );

  return (
    <select
      value={selectedLeadId}
      onChange={(e) => onSelectLead(e.target.value)}
      disabled={disabled}
      className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white
                 focus:outline-none focus:border-blue-500 disabled:opacity-50
                 disabled:cursor-not-allowed min-w-[200px]"
    >
      <option value="">Select a lead...</option>
      {(Object.keys(groupedLeads) as LeadType[]).map((type) =>
        groupedLeads[type].length > 0 ? (
          <optgroup key={type} label={typeLabels[type]}>
            {groupedLeads[type].map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
              </option>
            ))}
          </optgroup>
        ) : null
      )}
    </select>
  );
}

export default LeadSelector;
