export function AboutSection() {
  const techInfo = [
    { label: 'Engine', value: '@mutuelle/engine' },
    { label: 'Framework', value: 'Electron + React 19' },
    { label: 'Database', value: 'SQLite (shared)' },
    { label: 'Browser', value: 'Playwright Chromium' },
  ];

  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>About</h2>
      <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold"
            style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
          >
            FDK
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Flow Development Kit</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>v1.0.0</p>
          </div>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          A developer tool for testing and debugging automation flows. Part of the Mutuelle automation suite.
        </p>
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {techInfo.map(({ label, value }) => (
              <div key={label}>
                <span style={{ color: 'var(--text-muted)' }}>{label}:</span>{' '}
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
