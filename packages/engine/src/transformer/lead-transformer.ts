/** LeadTransformer - Transforms raw lead data into form-ready data */
import { get } from 'lodash-es';
import type { ValidationError, ValidationResult, FieldValidation, TransformerConfig } from '../types/index.js';
import { validateField } from './validators.js';
import { applyTransform } from './transforms.js';

export interface TransformResult {
  success: boolean;
  data: Record<string, unknown>;
  validation: ValidationResult;
  eligibility?: { eligible: boolean; reason?: string };
}

export interface LeadTransformerConfig {
  validations?: FieldValidation[];
  transforms?: Record<string, TransformerConfig[]>;
  eligibility?: { field: string; condition: string; swapFlow?: string };
}

export class LeadTransformer {
  private mapperData: Record<string, Record<string, string>> = {};

  constructor(private config: LeadTransformerConfig = {}) {}

  /** Register mapper data for value lookups */
  registerMapper(name: string, data: Record<string, string>): void {
    this.mapperData[name] = data;
  }

  /** Transform raw lead data based on config */
  transform(lead: Record<string, unknown>): TransformResult {
    const errors: ValidationError[] = [];
    const data: Record<string, unknown> = { ...lead };

    // Apply validations
    if (this.config.validations) {
      for (const fieldValidation of this.config.validations) {
        const value = get(lead, fieldValidation.field);
        const fieldErrors = validateField(fieldValidation.field, value, fieldValidation.rules);
        errors.push(...fieldErrors);
      }
    }

    // Apply transforms
    if (this.config.transforms) {
      for (const [field, pipeline] of Object.entries(this.config.transforms)) {
        let value = get(lead, field);
        for (const transformConfig of pipeline) {
          value = applyTransform(value, transformConfig.name, transformConfig.args);
        }
        this.setNestedValue(data, field, value);
      }
    }

    // Check eligibility (for Alptis swap logic)
    const eligibility = this.checkEligibility(data);

    return {
      success: errors.length === 0,
      data,
      validation: { valid: errors.length === 0, errors },
      eligibility,
    };
  }

  /** Apply mapper to transform value using lookup table */
  applyMapper(value: unknown, mapperName: string): string | null {
    const mapper = this.mapperData[mapperName];
    if (!mapper) return null;
    return mapper[String(value)] ?? null;
  }

  private checkEligibility(data: Record<string, unknown>): { eligible: boolean; reason?: string } | undefined {
    if (!this.config.eligibility) return undefined;
    const { field, condition } = this.config.eligibility;
    const value = get(data, field);
    const eligible = this.evaluateCondition(value, condition);
    return { eligible, reason: eligible ? undefined : `${field} failed: ${condition}` };
  }

  private evaluateCondition(value: unknown, condition: string): boolean {
    if (condition === 'notNull') return value !== null && value !== undefined;
    if (condition === 'true') return value === true;
    if (condition.startsWith('==')) return value === condition.slice(2).trim();
    return Boolean(value);
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] ?? {};
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
  }
}
