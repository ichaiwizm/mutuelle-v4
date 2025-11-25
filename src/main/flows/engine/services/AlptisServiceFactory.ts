/**
 * Alptis Service Factory
 *
 * Creates and caches service instances for Alptis platform.
 */

import type { PlatformServices } from "./types";
import { AlptisAuth } from "../../platforms/alptis/lib/AlptisAuth";
import { NavigationStep } from "../../platforms/alptis/products/sante-select/steps/navigation";
import { FormFillOrchestrator } from "../../platforms/alptis/products/sante-select/steps/form-fill/FormFillOrchestrator";
import { getAlptisCredentials } from "../../config";

// Singleton cache
let cachedServices: PlatformServices | null = null;

/**
 * Creates Alptis platform services
 * Uses lazy singleton pattern for caching
 */
export function createAlptisServices(): PlatformServices {
  if (cachedServices) {
    return cachedServices;
  }

  cachedServices = {
    auth: new AlptisAuth(getAlptisCredentials()),
    navigation: new NavigationStep(),
    formFill: new FormFillOrchestrator(),
  };

  return cachedServices;
}

/**
 * Resets the service cache (useful for testing)
 */
export function resetAlptisServices(): void {
  cachedServices = null;
}
