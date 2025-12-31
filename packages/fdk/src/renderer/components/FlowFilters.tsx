/**
 * Flow Filters
 * Search, source, platform and status filters for flows
 */
import { type FlowSource } from '../hooks/useFlows';
import { SourceToggleBar } from './filters/SourceToggleBar';
import { SearchInput } from './filters/SearchInput';
import { FilterSelect } from './filters/FilterSelect';

type StatusFilter = 'all' | 'active' | 'draft' | 'deprecated';

interface FlowFiltersProps {
  search: string;
  sourceFilter: FlowSource;
  statusFilter: StatusFilter;
  platformFilter: string;
  platforms: string[];
  onSearchChange: (search: string) => void;
  onSourceFilterChange: (source: FlowSource) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onPlatformFilterChange: (platform: string) => void;
}

export function FlowFilters({
  search,
  sourceFilter,
  statusFilter,
  platformFilter,
  platforms,
  onSearchChange,
  onSourceFilterChange,
  onStatusFilterChange,
  onPlatformFilterChange,
}: FlowFiltersProps) {
  const platformOptions = platforms.map((p) => ({
    value: p,
    label: p === 'all' ? 'All Platforms' : p.charAt(0).toUpperCase() + p.slice(1),
  }));

  const statusOptions: Array<{ value: StatusFilter; label: string }> = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'deprecated', label: 'Deprecated' },
  ];

  return (
    <>
      <SourceToggleBar value={sourceFilter} onChange={onSourceFilterChange} />

      <div className="flex items-center gap-4 mb-6">
        <SearchInput value={search} placeholder="Search flows..." onChange={onSearchChange} />
        <FilterSelect value={platformFilter} options={platformOptions} onChange={onPlatformFilterChange} />
        <FilterSelect value={statusFilter} options={statusOptions} onChange={onStatusFilterChange} />
      </div>
    </>
  );
}
