import { PageHeader } from '../components/common';
import { CredentialsSection, AboutSection, CacheSection } from '../components/settings';
import { useCredentials } from '../hooks/useCredentials';

export function SettingsPage() {
  const { credentials, loading } = useCredentials();

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader title="Settings" description="Manage application settings and credentials" />
      <div className="p-8 space-y-8 max-w-3xl">
        <CredentialsSection credentials={credentials} loading={loading} />
        <AboutSection />
        <CacheSection />
      </div>
    </div>
  );
}
