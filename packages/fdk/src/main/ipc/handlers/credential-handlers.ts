/**
 * Credential IPC Handlers
 * Handles credential listing and retrieval from the shared database
 */
import type { IpcMainInvokeEvent } from 'electron';
import {
  getCredentials,
  listPlatformsWithCredentials,
  type PlatformCredentials,
} from '../../db/credential-repository';

/**
 * List all platforms that have saved credentials
 */
export async function handleCredentialListPlatforms(
  _event: IpcMainInvokeEvent
): Promise<string[]> {
  console.log('[credential-handlers] Listing platforms with credentials');
  return listPlatformsWithCredentials();
}

/**
 * Get credentials for a specific platform
 */
export async function handleCredentialGet(
  _event: IpcMainInvokeEvent,
  platform: string
): Promise<PlatformCredentials | null> {
  console.log(`[credential-handlers] Getting credentials for: ${platform}`);
  return getCredentials(platform);
}
