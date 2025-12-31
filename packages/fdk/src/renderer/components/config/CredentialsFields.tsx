/**
 * Credentials Fields Component
 * Username and password inputs for optional credentials
 */
interface CredentialsFieldsProps {
  credentials: { username: string; password: string };
  disabled: boolean;
  onChange: (credentials: { username: string; password: string }) => void;
}

export function CredentialsFields({ credentials, disabled, onChange }: CredentialsFieldsProps) {
  const inputStyle = {
    backgroundColor: 'var(--bg-elevated)',
    borderColor: 'var(--border-subtle)',
    color: 'var(--text-primary)',
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        Credentials (Optional)
      </label>
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        Leave empty to use saved credentials
      </p>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => onChange({ ...credentials, username: e.target.value })}
          disabled={disabled}
          className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-50"
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => onChange({ ...credentials, password: e.target.value })}
          disabled={disabled}
          className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-50"
          style={inputStyle}
        />
      </div>
    </div>
  );
}
