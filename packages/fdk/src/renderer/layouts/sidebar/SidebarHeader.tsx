/**
 * Sidebar Header Component
 * Logo and version display
 */

export function SidebarHeader() {
  return (
    <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm"
          style={{
            backgroundColor: 'var(--accent-muted)',
            color: 'var(--accent-primary)',
          }}
        >
          FDK
        </div>
        <div>
          <h1 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Flow Dev Kit
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
