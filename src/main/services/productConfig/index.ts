/**
 * Product Configuration Services
 * Unified export for all product configuration functionality
 */

export { ProductConfigCore } from "./productConfigCore";
export { ProductConfigQuery } from "./productConfigQuery";

// Re-export types for convenience
export type { ProductConfiguration, ProductCategory, StepDefinition, StepType } from "../../../shared/types/product";
