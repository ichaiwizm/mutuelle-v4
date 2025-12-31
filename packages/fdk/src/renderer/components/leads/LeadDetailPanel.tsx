import type { LeadType } from '../../hooks/useLeads';

interface LeadData {
  id: string;
  name: string;
  type: LeadType;
  data: Record<string, unknown>;
}

interface LeadDetailPanelProps {
  lead: LeadData;
  onClose: () => void;
}

const typeColors: Record<LeadType, { bg: string; text: string }> = {
  solo: { bg: 'rgba(0, 217, 255, 0.15)', text: 'var(--accent-primary)' },
  conjoint: { bg: 'rgba(61, 220, 132, 0.15)', text: 'var(--status-success)' },
  enfants: { bg: 'rgba(255, 190, 11, 0.15)', text: 'var(--status-warning)' },
  famille: { bg: 'rgba(139, 92, 246, 0.15)', text: '#A78BFA' },
};

export function LeadDetailPanel({ lead, onClose }: LeadDetailPanelProps) {
  const colors = typeColors[lead.type];

  return (
    <aside
      className="w-96 border-l flex-shrink-0 flex flex-col overflow-hidden animate-slide-in-left"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Lead Details</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <DetailField label="Name" value={lead.name} />
          <div>
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Type</label>
            <p>
              <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
                {lead.type}
              </span>
            </p>
          </div>
          <DetailField label="ID" value={lead.id} mono />
          <div>
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Data</label>
            <pre
              className="mt-2 p-4 rounded-lg text-xs font-mono overflow-x-auto"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
            >
              {JSON.stringify(lead.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <p className={mono ? 'font-mono text-sm' : ''} style={{ color: mono ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}
