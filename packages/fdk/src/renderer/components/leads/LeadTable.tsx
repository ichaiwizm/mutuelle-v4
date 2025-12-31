import type { LeadType } from '../../hooks/useLeads';

interface Lead {
  id: string;
  name: string;
  type: LeadType;
  createdAt: string;
}

interface LeadTableProps {
  leads: Lead[];
  selectedLead: string | null;
  onSelectLead: (id: string | null) => void;
}

const typeColors: Record<LeadType, { bg: string; text: string }> = {
  solo: { bg: 'rgba(0, 217, 255, 0.15)', text: 'var(--accent-primary)' },
  conjoint: { bg: 'rgba(61, 220, 132, 0.15)', text: 'var(--status-success)' },
  enfants: { bg: 'rgba(255, 190, 11, 0.15)', text: 'var(--status-warning)' },
  famille: { bg: 'rgba(139, 92, 246, 0.15)', text: '#A78BFA' },
};

export function LeadTable({ leads, selectedLead, onSelectLead }: LeadTableProps) {
  if (leads.length === 0) {
    return <LeadEmptyState />;
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
            {['Name', 'Type', 'Created', 'Actions'].map((header, i) => (
              <th
                key={header}
                className={`${i === 3 ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-medium uppercase tracking-wider`}
                style={{ color: 'var(--text-muted)' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {leads.map((lead, index) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              index={index}
              isSelected={lead.id === selectedLead}
              onSelect={onSelectLead}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadRow({
  lead,
  index,
  isSelected,
  onSelect,
}: {
  lead: Lead;
  index: number;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const colors = typeColors[lead.type];
  return (
    <tr
      onClick={() => onSelect(isSelected ? null : lead.id)}
      className="cursor-pointer transition-colors hover:bg-[var(--bg-hover)] animate-fade-in"
      style={{ animationDelay: `${index * 20}ms`, backgroundColor: isSelected ? 'var(--bg-hover)' : undefined }}
    >
      <td className="px-4 py-3">
        <span style={{ color: 'var(--text-primary)' }}>{lead.name}</span>
      </td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
          {lead.type}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {new Date(lead.createdAt).toLocaleDateString()}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(lead.id); }}
          className="text-sm hover:underline"
          style={{ color: 'var(--accent-primary)' }}
        >
          View
        </button>
      </td>
    </tr>
  );
}

function LeadEmptyState() {
  return (
    <div className="p-12 rounded-xl border text-center" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
      <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <p style={{ color: 'var(--text-secondary)' }}>No leads found</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Import leads to get started</p>
    </div>
  );
}
