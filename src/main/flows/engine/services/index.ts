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
import { createEntoriaServices, resetEntoriaServices } from "./EntoriaServiceFactory";
import { CredentialsService } from "../../../services/credentials";

// Export pour les autres modules
export { createAlptisServices, resetAlptisServices };
export { createSanteProPlusServices, resetSanteProPlusServices };
export { createSwissLifeServices, resetSwissLifeServices };
export { createEntoriaServices, resetEntoriaServices };

/**
 * Get platform name from flow key
 */
function getPlatformFromFlowKey(flowKey: string): "alptis" | "swisslife" | "entoria" {
  if (flowKey.startsWith("alptis_")) {
    return "alptis";
  }
  if (flowKey.startsWith("swisslife_")) {
    return "swisslife";
  }
  if (flowKey.startsWith("entoria_")) {
    return "entoria";
  }
  throw new Error(`Unknown platform for flow: ${flowKey}`);
}

/**
 * Get credentials from environment variables (fallback for E2E tests)
 */
function getCredentialsFromEnv(platform: "alptis" | "swisslife" | "entoria"): { login: string; password: string; courtierCode?: string } | null {
  if (platform === "alptis") {
    // Try both ALPTIS_TEST_* (for tests) and ALPTIS_* (for production)
    const login = process.env.ALPTIS_TEST_USERNAME || process.env.ALPTIS_USERNAME;
    const password = process.env.ALPTIS_TEST_PASSWORD || process.env.ALPTIS_PASSWORD;
    if (login && password) {
      return { login, password };
    }
  } else if (platform === "swisslife") {
    const login = process.env.SWISSLIFE_TEST_USERNAME || process.env.SWISSLIFE_USERNAME;
    const password = process.env.SWISSLIFE_TEST_PASSWORD || process.env.SWISSLIFE_PASSWORD;
    if (login && password) {
      return { login, password };
    }
  } else if (platform === "entoria") {
    const login = process.env.ENTORIA_TEST_USERNAME || process.env.ENTORIA_USERNAME;
    const password = process.env.ENTORIA_TEST_PASSWORD || process.env.ENTORIA_PASSWORD;
    const courtierCode = process.env.ENTORIA_TEST_COURTIER_CODE || process.env.ENTORIA_COURTIER_CODE;
    if (login && password && courtierCode) {
      return { login, password, courtierCode };
    }
  }
  return null;
}

/**
 * Get platform services by flow key
 * Loads credentials from database via CredentialsService, with fallback to environment variables
 */
export async function getServicesForFlow(flowKey: string) {
  console.log(`[SERVICES] getServicesForFlow called for: ${flowKey}`);
  const startTime = Date.now();

  const platform = getPlatformFromFlowKey(flowKey);
  console.log(`[SERVICES] Platform detected: ${platform}`);

  let credentials: { login: string; password: string; courtierCode?: string } | null = null;

  // Try database first
  console.log(`[SERVICES] Loading credentials from database...`);
  const credentialsStart = Date.now();
  try {
    credentials = await CredentialsService.getByPlatform(platform);
    if (credentials) {
      console.log(`[SERVICES] Credentials loaded from DB in ${Date.now() - credentialsStart}ms`);
    }
  } catch (error) {
    console.log(`[SERVICES] Failed to load credentials from DB: ${error instanceof Error ? error.message : 'unknown error'}`);
  }

  // Fallback to environment variables (useful for E2E tests)
  if (!credentials) {
    console.log(`[SERVICES] Trying environment variables fallback...`);
    credentials = getCredentialsFromEnv(platform);
    if (credentials) {
      console.log(`[SERVICES] Credentials loaded from environment variables`);
    }
  }

  if (!credentials) {
    console.error(`[SERVICES] No credentials found for platform: ${platform}`);
    throw new Error(
      `No credentials found for platform "${platform}". ` +
      `Please configure credentials in the app settings or set environment variables (${platform.toUpperCase()}_USERNAME, ${platform.toUpperCase()}_PASSWORD).`
    );
  }
  console.log(`[SERVICES] Credentials found for user: ${credentials.login.substring(0, 3)}...`);

  if (platform === "alptis") {
    // Differentiate between Alptis products
    if (flowKey === "alptis_sante_pro_plus") {
      console.log(`[SERVICES] Creating Alptis Santé Pro Plus services...`);
      const services = createSanteProPlusServices({
        username: credentials.login,
        password: credentials.password,
      });
      console.log(`[SERVICES] Alptis Santé Pro Plus services created in ${Date.now() - startTime}ms total`);
      return services;
    }

    // Default to Santé Select
    console.log(`[SERVICES] Creating Alptis Santé Select services...`);
    const services = createAlptisServices({
      username: credentials.login,
      password: credentials.password,
    });
    console.log(`[SERVICES] Alptis Santé Select services created in ${Date.now() - startTime}ms total`);
    return services;
  }

  if (platform === "entoria") {
    // Entoria requires courtierCode
    if (!credentials.courtierCode) {
      throw new Error(
        `Entoria credentials require a courtier code. Please configure it in the app settings or set ENTORIA_COURTIER_CODE environment variable.`
      );
    }
    console.log(`[SERVICES] Creating Entoria services...`);
    const services = createEntoriaServices({
      username: credentials.login,
      password: credentials.password,
      courtierCode: credentials.courtierCode,
    });
    console.log(`[SERVICES] Entoria services created in ${Date.now() - startTime}ms total`);
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
  resetEntoriaServices();
}
