/**
 * Field validators for lead data validation
 */
import type { ValidationRule, ValidationError, ValidationRuleType } from '../types/index.js';

const PATTERNS: Record<string, RegExp> = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(?:0|\+33)[1-9](?:[0-9]{8})$/,
  codePostal: /^\d{5}$/,
};

type ValidatorFn = (value: unknown, rule: ValidationRule) => string | null;

const validators: Record<ValidationRuleType, ValidatorFn> = {
  required: (value, rule) =>
    (value === null || value === undefined || value === '')
      ? (rule.message ?? 'Field is required')
      : null,

  minLength: (value, rule) =>
    typeof value === 'string' && value.length < (rule.value as number)
      ? (rule.message ?? `Minimum length is ${rule.value}`)
      : null,

  maxLength: (value, rule) =>
    typeof value === 'string' && value.length > (rule.value as number)
      ? (rule.message ?? `Maximum length is ${rule.value}`)
      : null,

  pattern: (value, rule) =>
    typeof value === 'string' && !new RegExp(rule.value as string).test(value)
      ? (rule.message ?? `Value does not match pattern`)
      : null,

  email: (value) =>
    typeof value === 'string' && !PATTERNS.email.test(value)
      ? 'Invalid email format'
      : null,

  phone: (value) =>
    typeof value === 'string' && !PATTERNS.phone.test(value.replace(/\s/g, ''))
      ? 'Invalid phone format'
      : null,

  date: (value) =>
    typeof value === 'string' && !PATTERNS.date.test(value)
      ? 'Invalid date format (expected YYYY-MM-DD)'
      : null,

  range: (value, rule) => {
    const { min, max } = rule.value as { min?: number; max?: number };
    const num = Number(value);
    if (isNaN(num)) return 'Value must be a number';
    if (min !== undefined && num < min) return `Value must be at least ${min}`;
    if (max !== undefined && num > max) return `Value must be at most ${max}`;
    return null;
  },

  enum: (value, rule) =>
    !((rule.value as unknown[]) ?? []).includes(value)
      ? (rule.message ?? `Value must be one of: ${(rule.value as unknown[]).join(', ')}`)
      : null,

  custom: () => null, // Custom validators handled externally
};

export function validateField(
  field: string,
  value: unknown,
  rules: ValidationRule[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    if (rule.optional && (value === null || value === undefined || value === '')) {
      continue;
    }

    const validator = validators[rule.type];
    if (!validator) continue;

    const errorMessage = validator(value, rule);
    if (errorMessage) {
      errors.push({ field, rule: rule.type, message: errorMessage, value });
    }
  }

  return errors;
}

export function validateFormat(value: string, format: keyof typeof PATTERNS): boolean {
  return PATTERNS[format]?.test(value) ?? false;
}
