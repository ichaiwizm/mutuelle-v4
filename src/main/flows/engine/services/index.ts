/**
 * Platform Services
 *
 * Unified exports for platform service factories.
 */

export type {
  IAuthService,
  INavigationService,
  INavigationServiceWithIframe,
  IFormFillService,
  PlatformServices,
} from "./types";

export { hasIframeSupport } from "./types";

// Import pour utilisation locale
import { createAlptisServices, resetAlptisServices } from "./AlptisServiceFactory";
import { createSwissLifeServices, resetSwissLifeServices } from "./SwissLifeServiceFactory";

// Export pour les autres modules
export { createAlptisServices, resetAlptisServices };
export { createSwissLifeServices, resetSwissLifeServices };

/**
 * Get platform services by flow key
 */
export function getServicesForFlow(flowKey: string) {
  if (flowKey.startsWith("alptis_")) {
    return createAlptisServices();
  }
  if (flowKey.startsWith("swisslife_")) {
    return createSwissLifeServices();
  }
  throw new Error(`No services configured for flow: ${flowKey}`);
}

/**
 * Reset all service caches
 */
export function resetAllServices(): void {
  resetAlptisServices();
  resetSwissLifeServices();
}
