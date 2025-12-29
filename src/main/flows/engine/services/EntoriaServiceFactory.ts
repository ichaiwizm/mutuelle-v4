/**
 * Entoria Service Factory
 *
 * Creates and caches service instances for Entoria platform.
 */

import type { PlatformServices } from "./types";
import { EntoriaAuth, type EntoriaAuthConfig } from "../../platforms/entoria/lib/EntoriaAuth";
import { EntoriaPackFamilleNavigation } from "../../platforms/entoria/products/pack-famille/steps/navigation";
import { FormFillOrchestrator } from "../../platforms/entoria/products/pack-famille/steps/form-fill/FormFillOrchestrator";

// Singleton cache with credentials hash to detect changes
let cachedServices: PlatformServices | null = null;
let cachedCredentialsHash: string | null = null;

function hashCredentials(creds: EntoriaAuthConfig): string {
  return `${creds.courtierCode}:${creds.username}:${creds.password.length}`;
}

/**
 * Creates Entoria platform services
 * @param credentials - Platform credentials loaded from CredentialsService
 */
export function createEntoriaServices(credentials: EntoriaAuthConfig): PlatformServices {
  const hash = hashCredentials(credentials);

  // Return cached if credentials haven't changed
  if (cachedServices && cachedCredentialsHash === hash) {
    return cachedServices;
  }

  cachedServices = {
    auth: new EntoriaAuth(credentials),
    navigation: new EntoriaPackFamilleNavigation(),
    formFill: new FormFillOrchestrator(),
  };
  cachedCredentialsHash = hash;

  return cachedServices;
}

/**
 * Resets the service cache (useful for testing)
 */
export function resetEntoriaServices(): void {
  cachedServices = null;
  cachedCredentialsHash = null;
}
