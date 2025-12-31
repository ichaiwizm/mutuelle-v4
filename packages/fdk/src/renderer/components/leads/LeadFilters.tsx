import type { LeadType } from '../../hooks/useLeads';

interface LeadFiltersProps {
  search: string;
  typeFilter: LeadType | 'all';
  resultCount: number;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: LeadType | 'all') => void;
}

export function LeadFilters({
  search,
  typeFilter,
  resultCount,
  onSearchChange,
  onTypeFilterChange,
}: LeadFiltersProps) {
  return (
    <div className="px-8 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value as LeadType | 'all')}
          className="px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent-primary)]"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="all">All Types</option>
          <option value="solo">Solo</option>
          <option value="conjoint">Conjoint</option>
          <option value="enfants">Enfants</option>
          <option value="famille">Famille</option>
        </select>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {resultCount} lead{resultCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
