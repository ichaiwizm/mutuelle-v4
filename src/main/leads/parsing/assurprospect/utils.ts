/**
 * Clean email value
 */
export function cleanEmail(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/([^\s<]+@[^\s>]+)/);
  return match ? match[1] : value;
}

/**
 * Clean phone number
 */
export function cleanPhone(value?: string): string | undefined {
  return value?.trim();
}

/**
 * Parse numeric value
 */
export function parseNumeric(value?: string): number | undefined {
  if (!value) return undefined;
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
}

/**
 * Clean HTML value (remove &nbsp; and trim)
 */
export function cleanHtmlValue(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if an object has any non-undefined values
 */
export function hasData(obj: Record<string, unknown> | undefined): boolean {
  if (!obj) return false;
  return Object.values(obj).some(v => v !== undefined && v !== '');
}
