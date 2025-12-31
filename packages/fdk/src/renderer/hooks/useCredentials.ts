import { useState, useEffect } from 'react';

interface CredentialInfo {
  platform: string;
  username: string;
  hasPassword: boolean;
  hasCourtierCode: boolean;
}

export function useCredentials() {
  const [credentials, setCredentials] = useState<CredentialInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    setCredentials([]);
  }, []);

  return { credentials, loading };
}
