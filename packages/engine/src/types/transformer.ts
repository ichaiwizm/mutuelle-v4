/**
 * Transformer, Mapper, and Validation types for data processing
 */

/** Built-in transformer functions */
export type BuiltInTransformer =
  | 'uppercase' | 'lowercase' | 'trim' | 'toDate' | 'toNumber'
  | 'toBoolean' | 'split' | 'join' | 'replace' | 'format' | 'default';

/** Transformer configuration */
export interface TransformerConfig {
  name: string | BuiltInTransformer;
  args?: Record<string, unknown>;
}

/** Pipeline of transformers applied in sequence */
export type TransformerPipeline = TransformerConfig[];

/** Field mapping from source to target */
export interface FieldMapping {
  from: string;
  to: string;
  transform?: TransformerPipeline;
  default?: unknown;
}

/** Mapper configuration for data transformation */
export interface MapperConfig {
  name: string;
  mappings: FieldMapping[];
  strict?: boolean;
}

/** Validation rule types */
export type ValidationRuleType =
  | 'required' | 'minLength' | 'maxLength' | 'pattern'
  | 'email' | 'phone' | 'date' | 'range' | 'enum' | 'custom';

/** Single validation rule */
export interface ValidationRule {
  type: ValidationRuleType;
  value?: unknown;
  message?: string;
  optional?: boolean;
}

/** Field validation configuration */
export interface FieldValidation {
  field: string;
  rules: ValidationRule[];
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/** Single validation error */
export interface ValidationError {
  field: string;
  rule: ValidationRuleType;
  message: string;
  value?: unknown;
}

/** Value resolver for dynamic values */
export interface ValueResolver {
  expression: string;
  fallback?: unknown;
  transform?: TransformerPipeline;
}
