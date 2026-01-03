/**
 * Devis Extraction Types
 *
 * Types for extracting quote data from insurance platform result pages.
 */

/**
 * Data extracted from a platform's devis/quote result page
 */
export type ExtractedDevisData = {
  /** Monthly premium amount */
  monthlyPremium?: number;
  /** Yearly premium amount */
  yearlyPremium?: number;
  /** Coverage level (e.g., "3", "Premium", "Standard") */
  coverageLevel?: string;
  /** Name of the selected formula/plan */
  formuleName?: string;
  /** Effective date of the quote */
  effectiveDate?: string;
  /** Direct URL to access the quote on the platform */
  devisUrl?: string;
  /** Platform-specific quote/project reference number */
  quoteReference?: string;
  /** Additional platform-specific data */
  platformSpecific?: Record<string, unknown>;
};

/**
 * Result of a devis extraction attempt
 */
export type DevisExtractionResult = {
  /** Whether extraction was successful */
  success: boolean;
  /** Extracted data (if successful) */
  data?: ExtractedDevisData;
  /** Path to downloaded PDF (if available) */
  pdfPath?: string;
  /** Path to screenshot of result page */
  screenshotPath?: string;
  /** Error message (if failed) */
  errorMessage?: string;
};

/**
 * Selectors configuration for a platform's result page
 */
export type ResultPageSelectors = {
  /** CSS selector for price element */
  priceSelector: string;
  /** CSS selector for formula/plan name */
  formulaSelector?: string;
  /** URL pattern regex for result page */
  urlPattern?: string;
  /** CSS selector for quote reference */
  referenceSelector?: string;
  /** CSS selector for PDF download button/link */
  pdfSelector?: string;
};
