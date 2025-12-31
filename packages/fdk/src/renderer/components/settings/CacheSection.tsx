export function CacheSection() {
  const handleClearCache = () => {
    window.electron.flow.invalidateCache?.().then(() => {
      alert('Cache cleared');
    });
  };

  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Cache</h2>
      <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Flow Cache</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Clear cached flow definitions to force reload from database
            </p>
          </div>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-hover)]"
            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}
          >
            Clear Cache
          </button>
        </div>
      </div>
    </section>
  );
}
