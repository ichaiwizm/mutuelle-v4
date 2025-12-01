/**
 * SwissLife One Service Factory
 *
 * Creates and caches service instances for SwissLife One platform.
 */

import type { PlatformServices } from "./types";
import { SwissLifeOneAuth, type SwissLifeOneAuthConfig } from "../../platforms/swisslifeone/lib/SwissLifeOneAuth";
import { SwissLifeNavigationStep } from "../../platforms/swisslifeone/products/slsis/steps/navigation";
import { FormFillOrchestrator } from "../../platforms/swisslifeone/products/slsis/steps/form-fill/FormFillOrchestrator";

// Singleton cache with credentials hash to detect changes
let cachedServices: PlatformServices | null = null;
let cachedCredentialsHash: string | null = null;

function hashCredentials(creds: SwissLifeOneAuthConfig): string {
  return `${creds.username}:${creds.password.length}`;
}

/**
 * Creates SwissLife One platform services
 * @param credentials - Platform credentials loaded from CredentialsService
 */
export function createSwissLifeServices(credentials: SwissLifeOneAuthConfig): PlatformServices {
  const hash = hashCredentials(credentials);

  // Return cached if credentials haven't changed
  if (cachedServices && cachedCredentialsHash === hash) {
    return cachedServices;
  }

  cachedServices = {
    auth: new SwissLifeOneAuth(credentials),
    navigation: new SwissLifeNavigationStep(),
    formFill: new FormFillOrchestrator(),
  };
  cachedCredentialsHash = hash;

  return cachedServices;
}

/**
 * Resets the service cache (useful for testing)
 */
export function resetSwissLifeServices(): void {
  cachedServices = null;
  cachedCredentialsHash = null;
}
