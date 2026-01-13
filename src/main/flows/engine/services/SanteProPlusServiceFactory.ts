/**
 * Santé Pro Plus Service Factory
 *
 * Creates and caches service instances for Santé Pro Plus product.
 * Uses the same auth as Alptis but different navigation and form fill.
 */

import type { PlatformServices } from "./types";
import { AlptisAuth, type AlptisAuthConfig } from "../../platforms/alptis/lib/AlptisAuth";
import { NavigationStep } from "../../platforms/alptis/products/sante-pro-plus/steps/navigation";
import { FormFillOrchestrator } from "../../platforms/alptis/products/sante-pro-plus/steps/form-fill/FormFillOrchestrator";
import { AlptisDevisExtractor } from "../../platforms/alptis/extractors/AlptisDevisExtractor";

// Singleton cache with credentials hash to detect changes
let cachedServices: PlatformServices | null = null;
let cachedCredentialsHash: string | null = null;

function hashCredentials(creds: AlptisAuthConfig): string {
  return `${creds.username}:${creds.password.length}`;
}

/**
 * Creates Santé Pro Plus platform services
 * @param credentials - Platform credentials loaded from CredentialsService
 */
export function createSanteProPlusServices(credentials: AlptisAuthConfig): PlatformServices {
  const hash = hashCredentials(credentials);

  // Return cached if credentials haven't changed
  if (cachedServices && cachedCredentialsHash === hash) {
    return cachedServices;
  }

  cachedServices = {
    auth: new AlptisAuth(credentials),
    navigation: new NavigationStep(),
    formFill: new FormFillOrchestrator(),
    devisExtractor: new AlptisDevisExtractor({ product: "sante_pro_plus" }),
  };
  cachedCredentialsHash = hash;

  return cachedServices;
}

/**
 * Resets the service cache (useful for testing)
 */
export function resetSanteProPlusServices(): void {
  cachedServices = null;
  cachedCredentialsHash = null;
}
