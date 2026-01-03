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
 * Extracted devis data from result page
 */
export type ExtractedDevisData = {
  monthlyPremium?: number;
  yearlyPremium?: number;
  coverageLevel?: string;
  formuleName?: string;
  effectiveDate?: string;
  devisUrl?: string;
  quoteReference?: string;
  platformSpecific?: Record<string, unknown>;
};

/**
 * Devis extraction result
 */
export type DevisExtractionResult = {
  success: boolean;
  data?: ExtractedDevisData;
  pdfPath?: string;
  screenshotPath?: string;
  errorMessage?: string;
};

/**
 * Devis extractor interface
 * Extracts quote data from the result page after form submission
 */
export interface IDevisExtractor {
  /**
   * Extract devis data from the current page state after submission
   */
  extractDevisData(pageOrFrame: Page | Frame, logger?: FlowLogger): Promise<ExtractedDevisData | null>;

  /**
   * Attempt to download PDF if available, returns path or null
   */
  downloadPdf?(pageOrFrame: Page | Frame, targetDir: string, logger?: FlowLogger): Promise<string | null>;

  /**
   * Get CSS selectors for the result page (for validation)
   */
  getResultPageSelectors(): {
    priceSelector: string;
    formulaSelector?: string;
    urlPattern?: string;
  };
}

/**
 * Platform services bundle
 */
export type PlatformServices = {
  auth: IAuthService;
  navigation: INavigationService | INavigationServiceWithIframe;
  formFill: IFormFillService;
  devisExtractor?: IDevisExtractor;
};

/**
 * Type guard to check if navigation service has iframe support
 */
export function hasIframeSupport(
  nav: INavigationService
): nav is INavigationServiceWithIframe {
  return "getIframe" in nav;
}
