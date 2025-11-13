import type { Lead } from '../../../shared/types';
import type { ExecutionContext, StepResult } from './FlowTypes';

/**
 * Result of a product execution
 */
export interface ProductResult {
  success: boolean;
  quote?: QuoteData;
  steps: StepResult[];
  duration: number;
  error?: Error;
  warnings?: string[];
}

/**
 * Quote data extracted from platform
 */
export interface QuoteData {
  quoteId: string;
  price: number;
  currency: string;
  coverageLevel?: string;
  options?: Record<string, unknown>;
  extractedAt: Date;
  rawData?: Record<string, unknown>;
}

/**
 * Product metadata for registry
 */
export interface ProductMetadata {
  key: string;
  name: string;
  platform: string;
  version: string;
  description?: string;
}

/**
 * Product constructor interface
 */
export interface ProductConstructor {
  new (): BaseProductInterface;
  metadata: ProductMetadata;
}

/**
 * Base product interface (for typing)
 */
export interface BaseProductInterface {
  execute(context: ExecutionContext): Promise<ProductResult>;
  getMetadata(): ProductMetadata;
}
