/**
 * Types for product automation settings
 * Frontend-only configuration stored in localStorage
 */

export type ProductSettings = {
  /** Run browser in headless mode (invisible) */
  headless: boolean;
  /** Step ID to stop at, or null to run all steps */
  stopAtStep: string | null;
};

export type AllProductSettings = Record<string, ProductSettings>;

export const DEFAULT_PRODUCT_SETTINGS: ProductSettings = {
  headless: true,
  stopAtStep: null,
};

export type ConfigTab = "credentials" | "automation";
