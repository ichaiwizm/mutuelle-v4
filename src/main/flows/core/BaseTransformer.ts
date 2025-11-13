import type { Lead } from '../../../shared/types';

/**
 * Transformation result with validation errors/warnings
 */
export interface TransformResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
}

/**
 * Abstract base class for lead transformers.
 * Transforms Lead objects into product-specific form data.
 */
export abstract class BaseTransformer<TFormData> {
  /**
   * Main transformation method - must be implemented by each product
   */
  abstract transform(lead: Lead): TransformResult<TFormData>;

  /**
   * Helper: convert DD/MM/YYYY to YYYY-MM-DD
   */
  protected convertDateToHtmlFormat(dateStr: string): string | null {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper: convert YYYY-MM-DD to DD/MM/YYYY
   */
  protected convertDateToFrenchFormat(dateStr: string): string | null {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  /**
   * Helper: format phone to XX.XX.XX.XX.XX
   */
  protected formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) return phone;
    return cleaned.match(/.{1,2}/g)?.join('.') ?? phone;
  }

  /**
   * Helper: extract value from Lead with fallback
   */
  protected extractValue<T>(
    obj: unknown,
    path: string,
    defaultValue?: T
  ): T | undefined {
    const keys = path.split('.');
    let value: unknown = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return defaultValue;
      }
    }

    return value as T;
  }

  /**
   * Helper: create success result
   */
  protected createSuccessResult(
    data: TFormData,
    warnings: string[] = []
  ): TransformResult<TFormData> {
    return { success: true, data, warnings };
  }

  /**
   * Helper: create failure result
   */
  protected createFailureResult(
    errors: string[]
  ): TransformResult<TFormData> {
    return { success: false, errors };
  }
}
