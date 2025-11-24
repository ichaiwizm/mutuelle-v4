/**
 * Core Product Configuration Service
 * Basic methods for accessing product configurations (code-based)
 */

import { getProductConfig as getConfigFromProducts, getProductsByCategory, getProductsByPlatform, PRODUCT_CONFIGS } from "../../flows/config/products";
import type { ProductConfiguration, ProductCategory, StepDefinition } from "../../../shared/types/product";
import { enrichProductConfig } from "../../../shared/types/product";

/**
 * Get configuration for a specific product by flow key
 * Standalone function for convenience
 * Automatically enriches the configuration with calculated metadata
 */
export function getProductConfig(flowKey: string): ProductConfiguration | undefined {
  const config = getConfigFromProducts(flowKey);
  return config ? enrichProductConfig(config) : undefined;
}

export const ProductConfigCore = {
  /**
   * Get configuration for a specific product by flow key
   * Automatically enriches the configuration with calculated metadata
   */
  getProductConfig(flowKey: string): ProductConfiguration | undefined {
    const config = getConfigFromProducts(flowKey);
    return config ? enrichProductConfig(config) : undefined;
  },

  /**
   * List all available product configurations
   * Automatically enriches all configurations with calculated metadata
   */
  listAllProducts(): ProductConfiguration[] {
    return Object.values(PRODUCT_CONFIGS).map(config => enrichProductConfig(config));
  },

  /**
   * List products filtered by category
   * Automatically enriches all configurations with calculated metadata
   */
  listProductsByCategory(category: ProductCategory): ProductConfiguration[] {
    return getProductsByCategory(category).map(config => enrichProductConfig(config));
  },

  /**
   * List products filtered by platform
   * Automatically enriches all configurations with calculated metadata
   */
  listProductsByPlatform(platform: string): ProductConfiguration[] {
    return getProductsByPlatform(platform).map(config => enrichProductConfig(config));
  },

  /**
   * Get all steps for a specific product
   */
  getProductSteps(flowKey: string): StepDefinition[] | undefined {
    const config = getConfigFromProducts(flowKey);
    return config?.steps;
  },

  /**
   * Get a specific step by ID within a product
   */
  getStep(flowKey: string, stepId: string): StepDefinition | undefined {
    const config = getConfigFromProducts(flowKey);
    return config?.steps.find((step) => step.id === stepId);
  },

  /**
   * Get required steps only (excludes optional conditional steps)
   */
  getRequiredSteps(flowKey: string): StepDefinition[] {
    const config = getConfigFromProducts(flowKey);
    return config?.steps.filter((step) => step.required) || [];
  },

  /**
   * Get conditional steps only
   */
  getConditionalSteps(flowKey: string): StepDefinition[] {
    const config = getConfigFromProducts(flowKey);
    return config?.steps.filter((step) => step.conditional) || [];
  },

  /**
   * Get all unique categories available
   */
  getAvailableCategories(): ProductCategory[] {
    const categories = new Set<ProductCategory>();
    Object.values(PRODUCT_CONFIGS).forEach((config) => {
      categories.add(config.category);
    });
    return Array.from(categories);
  },

  /**
   * Get all unique platforms available
   */
  getAvailablePlatforms(): string[] {
    const platforms = new Set<string>();
    Object.values(PRODUCT_CONFIGS).forEach((config) => {
      platforms.add(config.platform);
    });
    return Array.from(platforms);
  },

  /**
   * Calculate total estimated duration for a flow
   */
  getEstimatedDuration(flowKey: string): number {
    const steps = this.getProductSteps(flowKey);
    if (!steps) return 0;

    return steps.reduce((total, step) => {
      return total + (step.estimatedDuration || 0);
    }, 0);
  },

  /**
   * Check if a product configuration exists
   */
  exists(flowKey: string): boolean {
    return flowKey in PRODUCT_CONFIGS;
  },
};
