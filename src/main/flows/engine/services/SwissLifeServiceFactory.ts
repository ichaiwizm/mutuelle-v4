/**
 * SwissLife One Service Factory
 *
 * Creates and caches service instances for SwissLife One platform.
 */

import type { PlatformServices } from "./types";
import { SwissLifeOneAuth } from "../../platforms/swisslifeone/lib/SwissLifeOneAuth";
import { SwissLifeNavigationStep } from "../../platforms/swisslifeone/products/slsis/steps/navigation";
import { FormFillOrchestrator } from "../../platforms/swisslifeone/products/slsis/steps/form-fill/FormFillOrchestrator";
import { getSwissLifeOneCredentials } from "../../config";

// Singleton cache
let cachedServices: PlatformServices | null = null;

/**
 * Creates SwissLife One platform services
 * Uses lazy singleton pattern for caching
 */
export function createSwissLifeServices(): PlatformServices {
  if (cachedServices) {
    return cachedServices;
  }

  cachedServices = {
    auth: new SwissLifeOneAuth(getSwissLifeOneCredentials()),
    navigation: new SwissLifeNavigationStep(),
    formFill: new FormFillOrchestrator(),
  };

  return cachedServices;
}

/**
 * Resets the service cache (useful for testing)
 */
export function resetSwissLifeServices(): void {
  cachedServices = null;
}
