/**
 * LeadTransformerAdapter - Adapts FDK transformers to engine LeadTransformer
 * Bridges flow-specific transformers with the engine's transformation system
 */
import { LeadTransformer, type LeadTransformerConfig, type TransformResult } from '@mutuelle/engine';

export type FdkTransformFn = (lead: Record<string, unknown>) => Record<string, unknown>;

export interface FdkTransformerConfig {
  transform: FdkTransformFn;
  mappers?: Record<string, Record<string, string>>;
  validations?: LeadTransformerConfig['validations'];
}

export class LeadTransformerAdapter {
  private engineTransformer: LeadTransformer;
  private fdkTransform: FdkTransformFn;

  constructor(config: FdkTransformerConfig) {
    this.engineTransformer = new LeadTransformer({
      validations: config.validations,
    });
    this.fdkTransform = config.transform;

    // Register mappers if provided
    if (config.mappers) {
      for (const [name, data] of Object.entries(config.mappers)) {
        this.engineTransformer.registerMapper(name, data);
      }
    }
  }

  transform(lead: Record<string, unknown>): TransformResult {
    // First apply FDK-specific transformation
    const transformedData = this.fdkTransform(lead);

    // Then run through engine transformer for validation
    const result = this.engineTransformer.transform(transformedData);

    return {
      success: result.success,
      data: transformedData,
      validation: result.validation,
      eligibility: result.eligibility,
    };
  }
}
