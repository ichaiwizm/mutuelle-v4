/**
 * Platform Services Types
 *
 * Defines the interface for platform-specific services injected into steps.
 */

import type { Page, Frame } from "playwright";
import type { FlowLogger } from "../FlowLogger";

/**
 * Authentication service interface
 */
export interface IAuthService {
  login(page: Page, logger?: FlowLogger): Promise<void>;
}

/**
 * Navigation service interface
 */
export interface INavigationService {
  execute(page: Page, logger?: FlowLogger): Promise<void>;
}

/**
 * Navigation service with iframe support (for SwissLife)
 */
export interface INavigationServiceWithIframe extends INavigationService {
  getIframe(page: Page): Promise<Frame>;
}

/**
 * Form fill orchestrator interface (generic)
 */
export interface IFormFillService {
  checkForErrors(pageOrFrame: Page | Frame, logger?: FlowLogger): Promise<string[]>;
}

/**
 * Platform services bundle
 */
export type PlatformServices = {
  auth: IAuthService;
  navigation: INavigationService | INavigationServiceWithIframe;
  formFill: IFormFillService;
};

/**
 * Type guard to check if navigation service has iframe support
 */
export function hasIframeSupport(
  nav: INavigationService
): nav is INavigationServiceWithIframe {
  return "getIframe" in nav;
}
