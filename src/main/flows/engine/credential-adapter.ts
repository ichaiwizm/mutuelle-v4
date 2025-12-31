/**
 * Credential Adapter
 * Adapts the CredentialsService to the engine's Credentials format
 */
import { CredentialsService } from "@/main/services/credentials";
import type { Credentials } from "@mutuelle/engine";
import { logger } from "@/main/services/logger";

export interface CredentialAdapterOptions {
  /** Custom credential service (for testing) */
  credentialsService?: typeof CredentialsService;
}

export class CredentialAdapter {
  private readonly credentialsService: typeof CredentialsService;

  constructor(options: CredentialAdapterOptions = {}) {
    this.credentialsService = options.credentialsService ?? CredentialsService;
  }

  /**
   * Get credentials for a platform in the engine format
   * @param platform Platform name (e.g., "alptis", "entoria", "swisslife")
   * @returns Credentials object or null if not found
   */
  async getCredentials(platform: string): Promise<Credentials | null> {
    logger.debug("Getting credentials for engine", { service: "CREDENTIAL_ADAPTER", platform });

    const creds = await this.credentialsService.getByPlatform(platform);
    if (!creds) {
      logger.warn("No credentials found for platform", { service: "CREDENTIAL_ADAPTER", platform });
      return null;
    }

    // Map to engine credentials format
    const engineCreds: Credentials = {
      username: creds.login,
      password: creds.password,
    };

    // Add courtierCode if present (for Entoria)
    if (creds.courtierCode) {
      engineCreds.courtierCode = creds.courtierCode;
    }

    return engineCreds;
  }
}

export const credentialAdapter = new CredentialAdapter();
