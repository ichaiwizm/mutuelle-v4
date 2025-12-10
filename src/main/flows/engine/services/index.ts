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
import { createSanteProPlusServices, resetSanteProPlusServices } from "./SanteProPlusServiceFactory";
import { createSwissLifeServices, resetSwissLifeServices } from "./SwissLifeServiceFactory";
import { CredentialsService } from "../../../services/credentials";

// Export pour les autres modules
export { createAlptisServices, resetAlptisServices };
export { createSanteProPlusServices, resetSanteProPlusServices };
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
  console.log(`[SERVICES] getServicesForFlow called for: ${flowKey}`);
  const startTime = Date.now();

  const platform = getPlatformFromFlowKey(flowKey);
  console.log(`[SERVICES] Platform detected: ${platform}`);

  console.log(`[SERVICES] Loading credentials...`);
  const credentialsStart = Date.now();
  const credentials = await CredentialsService.getByPlatform(platform);
  console.log(`[SERVICES] Credentials loaded in ${Date.now() - credentialsStart}ms`);

  if (!credentials) {
    console.error(`[SERVICES] No credentials found for platform: ${platform}`);
    throw new Error(
      `No credentials found for platform "${platform}". ` +
      `Please configure credentials in the app settings before running automations.`
    );
  }
  console.log(`[SERVICES] Credentials found for user: ${credentials.login.substring(0, 3)}...`);

  if (platform === "alptis") {
    console.log(`[SERVICES] Creating Alptis services...`);
    const services = createAlptisServices({
      username: credentials.login,
      password: credentials.password,
    });
    console.log(`[SERVICES] Alptis services created in ${Date.now() - startTime}ms total`);
    return services;
  }

  // swisslifeone
  console.log(`[SERVICES] Creating SwissLife services...`);
  const services = createSwissLifeServices({
    username: credentials.login,
    password: credentials.password,
  });
  console.log(`[SERVICES] SwissLife services created in ${Date.now() - startTime}ms total`);
  return services;
}

/**
 * Reset all service caches
 */
export function resetAllServices(): void {
  resetAlptisServices();
  resetSanteProPlusServices();
  resetSwissLifeServices();
}
