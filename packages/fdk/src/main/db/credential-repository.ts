/**
 * FDK Credential Repository
 * Provides access to credentials from the main app's database
 */
import type { PlatformCredentials, CredentialSummary, SaveCredentialsData } from "./credential-types";
import {
  findByPlatform, findAll, findAllPlatforms,
  mapRowToCredentials, updateCredentials, insertCredentials,
} from "./credential-helpers";

export type { PlatformCredentials, CredentialSummary, SaveCredentialsData };

export function getCredentials(platform: string): PlatformCredentials | null {
  const row = findByPlatform(platform);
  if (!row) {
    console.log(`[CredentialRepository] No credentials for: ${platform}`);
    return null;
  }
  console.log(`[CredentialRepository] Credentials found for: ${platform}`);
  return mapRowToCredentials(row);
}

export function listPlatformsWithCredentials(): string[] {
  return findAllPlatforms();
}

export function hasCredentials(platform: string): boolean {
  return findByPlatform(platform) !== null;
}

export function getAllCredentials(): CredentialSummary[] {
  const rows = findAll();
  return rows.map((row) => ({
    platform: row.platform,
    username: row.login,
    hasPassword: !!row.password,
    hasCourtierCode: !!row.courtierCode,
  }));
}

export function saveCredentials(data: SaveCredentialsData): void {
  const existing = findByPlatform(data.platform);
  if (existing) {
    updateCredentials(data);
    console.log(`[CredentialRepository] Updated: ${data.platform}`);
  } else {
    insertCredentials(data);
    console.log(`[CredentialRepository] Saved: ${data.platform}`);
  }
}

export function initializeCredentials(): void {
  const defaults = [
    { platform: "swisslife", username: "UPFK76G", password: "04240424_aAAA" },
    { platform: "alptis", username: "Fragoso.n@france-epargne.fr", password: "Nicolas.epargne2024" },
    { platform: "entoria", username: "NFRAGOSO", password: "Fragoso0303.", courtierCode: "107754" },
  ];
  for (const cred of defaults) {
    if (!hasCredentials(cred.platform)) saveCredentials(cred);
  }
}
