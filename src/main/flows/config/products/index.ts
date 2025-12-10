/**
 * Product Configuration Registry
 *
 * Central registry of all product configurations.
 * Each product is defined in its own file.
 *
 * HOW TO ADD A NEW PRODUCT:
 * 1. Create a new file: {platform}-{product}.ts
 * 2. Export a ProductConfiguration constant
 * 3. Import and add it to PRODUCT_CONFIGS below
 * 4. The flowKey must match: {platform}_{product}
 */

import type { ProductConfiguration, ProductCategory } from "../../../../shared/types/product";
import { ALPTIS_SANTE_SELECT } from "./alptis-sante-select";
import { ALPTIS_SANTE_PRO_PLUS } from "./alptis-sante-pro-plus";
import { SWISSLIFE_ONE_SLSIS } from "./swisslife-one-slsis";

/**
 * Central registry - maps flowKey to ProductConfiguration
 */
export const PRODUCT_CONFIGS: Record<string, ProductConfiguration> = {
  [ALPTIS_SANTE_SELECT.flowKey]: ALPTIS_SANTE_SELECT,
  [ALPTIS_SANTE_PRO_PLUS.flowKey]: ALPTIS_SANTE_PRO_PLUS,
  [SWISSLIFE_ONE_SLSIS.flowKey]: SWISSLIFE_ONE_SLSIS,
};

/**
 * Get all available product flow keys
 */
export const AVAILABLE_FLOWS = Object.keys(PRODUCT_CONFIGS);

/**
 * Get product configuration by flow key
 */
export function getProductConfig(flowKey: string): ProductConfiguration | undefined {
  return PRODUCT_CONFIGS[flowKey];
}

/**
 * Get all products for a specific category
 */
export function getProductsByCategory(category: ProductCategory): ProductConfiguration[] {
  return Object.values(PRODUCT_CONFIGS).filter((config) => config.category === category);
}

/**
 * Get all products for a specific platform
 */
export function getProductsByPlatform(platform: string): ProductConfiguration[] {
  return Object.values(PRODUCT_CONFIGS).filter((config) => config.platform === platform);
}
