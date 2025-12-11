/**
 * Types for product automation settings
 * Frontend-only configuration stored in localStorage
 */

export type ProductSettings = {
  /** Run browser in headless mode (invisible) */
  headless: boolean;
  /** Auto-submit form or stop before submission for manual takeover */
  autoSubmit: boolean;
};

export type AllProductSettings = Record<string, ProductSettings>;

export const DEFAULT_PRODUCT_SETTINGS: ProductSettings = {
  headless: true,
  autoSubmit: true,
};

export type ConfigTab = "credentials" | "automation" | "data";
