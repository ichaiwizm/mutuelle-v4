/**
 * Product Configurations
 *
 * This file provides legacy product configuration for the UI and seeding.
 * The actual flow definitions are now in packages/fdk.
 */

import type { ProductConfiguration, ProductCategory } from "@/shared/types/product";
import { alptis_sante_select, alptis_sante_pro_plus, swisslife_one_slsis, entoria_pack_famille } from "./products/index";

/**
 * Map of all product configurations indexed by flow key
 */
export const PRODUCT_CONFIGS: Record<string, ProductConfiguration> = {
  alptis_sante_select,
  alptis_sante_pro_plus,
  swisslife_one_slsis,
  entoria_pack_famille,
};

/**
 * Get a product configuration by flow key
 */
export function getProductConfig(flowKey: string): ProductConfiguration | undefined {
  return PRODUCT_CONFIGS[flowKey];
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: ProductCategory): ProductConfiguration[] {
  return Object.values(PRODUCT_CONFIGS).filter((config) => config.category === category);
}

/**
 * Get products by platform
 */
export function getProductsByPlatform(platform: string): ProductConfiguration[] {
  return Object.values(PRODUCT_CONFIGS).filter((config) => config.platform === platform);
}

/**
 * Get all available flow keys
 */
export function getAllFlowKeys(): string[] {
  return Object.keys(PRODUCT_CONFIGS);
}
