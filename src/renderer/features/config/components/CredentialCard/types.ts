import type { Platform, PlatformState, CredentialFormData } from "../../hooks/useCredentials";

export interface CredentialCardProps {
  platform: Platform;
  state: PlatformState;
  onSave: (data: CredentialFormData) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onTest: () => Promise<any>;
  onResetTest: () => void;
}

export interface PlatformConfig {
  name: string;
  description: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  icon: string;
}
