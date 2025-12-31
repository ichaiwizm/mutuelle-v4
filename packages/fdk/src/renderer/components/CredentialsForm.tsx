import type { ReactNode } from 'react';
import { Input } from './ui/Input';

export interface Credentials {
  username: string;
  password: string;
}

interface CredentialsFormProps {
  credentials: Credentials;
  onChange: (credentials: Credentials) => void;
  disabled?: boolean;
}

export function CredentialsForm({
  credentials,
  onChange,
  disabled = false,
}: CredentialsFormProps): ReactNode {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Credentials
      </h3>
      <Input
        label="Username"
        type="text"
        value={credentials.username}
        onChange={e => onChange({ ...credentials, username: e.target.value })}
        placeholder="Enter username"
        disabled={disabled}
        autoComplete="username"
      />
      <Input
        label="Password"
        type="password"
        value={credentials.password}
        onChange={e => onChange({ ...credentials, password: e.target.value })}
        placeholder="Enter password"
        disabled={disabled}
        autoComplete="current-password"
      />
    </div>
  );
}
