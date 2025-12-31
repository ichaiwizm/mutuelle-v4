/**
 * Credential Types
 */

export interface PlatformCredentials {
  platform: string;
  username: string;
  password: string;
  courtierCode?: string;
}

export interface CredentialSummary {
  platform: string;
  username: string;
  hasPassword: boolean;
  hasCourtierCode: boolean;
}

export interface SaveCredentialsData {
  platform: string;
  username: string;
  password: string;
  courtierCode?: string;
}
