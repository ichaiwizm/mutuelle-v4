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
import { CredentialsService } from "../../../services/credentialsService";

// Export pour les autres modules
export { createAlptisServices, resetAlptisServices };
export { createSwissLifeServices, resetSwissLifeServices };

/**
 * Get platform name from flow key
 */
function getPlatformFromFlowKey(flowKey: string): "alptis" | "swisslife" {
  if (flowKey.startsWith("alptis_")) {
    return "alptis";
  }
  if (flowKey.startsWith("swisslife_")) {
    return "swisslife";
  }
  throw new Error(`Unknown platform for flow: ${flowKey}`);
}

/**
 * Get platform services by flow key
 * Loads credentials from database via CredentialsService
 */
export async function getServicesForFlow(flowKey: string) {
  const platform = getPlatformFromFlowKey(flowKey);

  const credentials = await CredentialsService.getByPlatform(platform);
  if (!credentials) {
    throw new Error(
      `No credentials found for platform "${platform}". ` +
      `Please configure credentials in the app settings before running automations.`
    );
  }

  if (platform === "alptis") {
    return createAlptisServices({
      username: credentials.login,
      password: credentials.password,
    });
  }

  // swisslifeone
  return createSwissLifeServices({
    username: credentials.login,
    password: credentials.password,
  });
}

/**
 * Reset all service caches
 */
export function resetAllServices(): void {
  resetAlptisServices();
  resetSwissLifeServices();
}
