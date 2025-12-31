interface CredentialInfo {
  platform: string;
  username: string;
  hasPassword: boolean;
  hasCourtierCode: boolean;
}

interface CredentialsSectionProps {
  credentials: CredentialInfo[];
  loading: boolean;
}

const platformColors: Record<string, { bg: string; text: string }> = {
  alptis: { bg: 'rgba(0, 217, 255, 0.15)', text: 'var(--accent-primary)' },
  swisslife: { bg: 'rgba(255, 190, 11, 0.15)', text: 'var(--status-warning)' },
  entoria: { bg: 'rgba(61, 220, 132, 0.15)', text: 'var(--status-success)' },
};

export function CredentialsSection({ credentials, loading }: CredentialsSectionProps) {
  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
        Platform Credentials
      </h2>
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <EmptyCredentials />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {credentials.map((cred) => <CredentialItem key={cred.platform} credential={cred} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyCredentials() {
  return (
    <div className="p-8 text-center">
      <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <p style={{ color: 'var(--text-secondary)' }}>No saved credentials</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        Credentials are managed in the main application. FDK reads from the shared database.
      </p>
    </div>
  );
}

function CredentialItem({ credential }: { credential: CredentialInfo }) {
  const colors = platformColors[credential.platform] || { bg: 'var(--bg-hover)', text: 'var(--text-secondary)' };
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold" style={{ backgroundColor: colors.bg, color: colors.text }}>
          {credential.platform.substring(0, 2).toUpperCase()}
        </span>
        <div>
          <h3 className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{credential.platform}</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{credential.username}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {credential.hasPassword && <Badge text="Password saved" color="green" />}
        {credential.hasCourtierCode && <Badge text="Courtier code" color="yellow" />}
      </div>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: 'green' | 'yellow' }) {
  const styles = color === 'green'
    ? { backgroundColor: 'rgba(61, 220, 132, 0.15)', color: 'var(--status-success)' }
    : { backgroundColor: 'rgba(255, 190, 11, 0.15)', color: 'var(--status-warning)' };
  return <span className="px-2 py-1 rounded text-xs" style={styles}>{text}</span>;
}
