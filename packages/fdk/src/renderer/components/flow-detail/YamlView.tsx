interface YamlViewProps {
  yaml: string;
  loading: boolean;
}

export function YamlView({ yaml, loading }: YamlViewProps) {
  if (loading) {
    return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading YAML...</div>;
  }

  return (
    <pre
      className="p-6 rounded-xl border overflow-x-auto font-mono text-sm"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
    >
      {yaml || 'No YAML content'}
    </pre>
  );
}
