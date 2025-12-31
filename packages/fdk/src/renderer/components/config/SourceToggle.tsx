/**
 * Source Toggle Component
 * Toggle between file, database, or all sources
 */
import { type FlowSource } from '../../hooks/useFlows';

interface SourceToggleProps {
  value: FlowSource;
  disabled: boolean;
  onChange: (source: FlowSource) => void;
}

export function SourceToggle({ value, disabled, onChange }: SourceToggleProps) {
  const sources: Array<{ key: FlowSource; label: string }> = [
    { key: 'all', label: 'Tous' },
    { key: 'file', label: 'Fichiers' },
    { key: 'database', label: 'DB' },
  ];

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        Source
      </label>
      <div className="inline-flex rounded-lg p-1 w-full" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        {sources.map((src) => (
          <button
            key={src.key}
            onClick={() => onChange(src.key)}
            disabled={disabled}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: value === src.key ? 'var(--accent-muted)' : 'transparent',
              color: value === src.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: value === src.key ? '0 0 8px rgba(0, 217, 255, 0.3)' : 'none',
            }}
          >
            {src.label}
          </button>
        ))}
      </div>
    </div>
  );
}
