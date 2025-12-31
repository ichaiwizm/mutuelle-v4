/**
 * Flows Page
 * List all available flows with filtering and search
 */
import { useState, useMemo } from 'react';
import { useFlows } from '../hooks/useFlows';
import { FlowFilters } from '../components/FlowFilters';
import { FlowList } from '../components/FlowList';

type StatusFilter = 'all' | 'active' | 'draft' | 'deprecated';

export function FlowsPage() {
  const { flows, loading, error, sourceFilter, setSourceFilter } = useFlows();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Get unique platforms
  const platforms = useMemo(() => {
    const uniquePlatforms = new Set(flows.map((f) => f.platform || 'unknown'));
    return ['all', ...Array.from(uniquePlatforms)];
  }, [flows]);

  // Filter flows
  const filteredFlows = useMemo(() => {
    return flows.filter((flow) => {
      const matchesSearch =
        !search ||
        flow.name.toLowerCase().includes(search.toLowerCase()) ||
        flow.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || flow.status === statusFilter;
      const matchesPlatform =
        platformFilter === 'all' || flow.platform === platformFilter;
      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [flows, search, statusFilter, platformFilter]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
          />
          <p style={{ color: 'var(--text-muted)' }}>Loading flows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          className="p-6 rounded-xl border max-w-md text-center"
          style={{
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderColor: 'var(--status-error)',
          }}
        >
          <p style={{ color: 'var(--status-error)' }}>Failed to load flows</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header
        className="px-8 py-6 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Flows
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Browse and manage automation flow definitions
        </p>
      </header>

      <div className="p-8">
        <FlowFilters
          search={search}
          sourceFilter={sourceFilter}
          statusFilter={statusFilter}
          platformFilter={platformFilter}
          platforms={platforms}
          onSearchChange={setSearch}
          onSourceFilterChange={setSourceFilter}
          onStatusFilterChange={setStatusFilter}
          onPlatformFilterChange={setPlatformFilter}
        />

        {/* Results count */}
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {filteredFlows.length} flow{filteredFlows.length !== 1 ? 's' : ''} found
        </p>

        <FlowList flows={filteredFlows} search={search} />
      </div>
    </div>
  );
}
