/**
 * Built-in transform functions for lead data transformation
 */

export type TransformFn = (value: unknown, args?: Record<string, unknown>) => unknown;

/** Extract department code from postal code (first 2 digits) */
export const extractDepartement: TransformFn = (value) => {
  if (typeof value !== 'string' || value.length < 2) return null;
  return value.substring(0, 2);
};

/** Check if value is not null/undefined */
export const isNotNull: TransformFn = (value) => value !== null && value !== undefined;

/** Check if array has elements */
export const hasLength: TransformFn = (value) =>
  Array.isArray(value) && value.length > 0;

/** Get first day of next month formatted as DD/MM/YYYY */
export const firstDayNextMonth: TransformFn = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return formatDateInternal(nextMonth, 'DD/MM/YYYY');
};

/** Format date to specified format */
export const formatDate: TransformFn = (value, args) => {
  const date = typeof value === 'string' ? new Date(value) : value as Date;
  if (!(date instanceof Date) || isNaN(date.getTime())) return null;
  const format = (args?.format as string) ?? 'DD/MM/YYYY';
  return formatDateInternal(date, format);
};

/** Internal date formatting helper */
function formatDateInternal(date: Date, format: string): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year)
    .replace('YY', year.slice(-2));
}

/** Convert to uppercase */
export const uppercase: TransformFn = (value) =>
  typeof value === 'string' ? value.toUpperCase() : value;

/** Convert to lowercase */
export const lowercase: TransformFn = (value) =>
  typeof value === 'string' ? value.toLowerCase() : value;

/** Trim whitespace */
export const trim: TransformFn = (value) =>
  typeof value === 'string' ? value.trim() : value;

/** Convert to number */
export const toNumber: TransformFn = (value) => {
  const num = Number(value);
  return isNaN(num) ? null : num;
};

/** Convert to boolean */
export const toBoolean: TransformFn = (value) =>
  value === true || value === 'true' || value === '1' || value === 1;

/** Apply default value if null/undefined */
export const defaultValue: TransformFn = (value, args) =>
  value ?? args?.value;

/** Built-in transforms registry */
export const builtInTransforms: Record<string, TransformFn> = {
  extractDepartement,
  isNotNull,
  hasLength,
  firstDayNextMonth,
  formatDate,
  uppercase,
  lowercase,
  trim,
  toNumber,
  toBoolean,
  default: defaultValue,
};

export function applyTransform(
  value: unknown,
  transformName: string,
  args?: Record<string, unknown>
): unknown {
  const transform = builtInTransforms[transformName];
  if (!transform) {
    throw new Error(`Unknown transform: ${transformName}`);
  }
  return transform(value, args);
}
