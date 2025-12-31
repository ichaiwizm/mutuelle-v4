/**
 * Platform Services
 *
 * Unified exports for platform service types.
 *
 * NOTE: The YAML-based flow engine now handles service creation dynamically.
 */

export type {
  IAuthService,
  INavigationService,
  INavigationServiceWithIframe,
  IFormFillService,
  PlatformServices,
} from "./types";

export { hasIframeSupport } from "./types";
