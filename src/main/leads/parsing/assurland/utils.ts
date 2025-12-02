/**
 * Normalize civilite to standard format
 */
export function normalizeCivilite(value?: string): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes('monsieur') || lower === 'm') return 'M';
  if (lower.includes('madame') || lower === 'mme') return 'Mme';
  if (lower.includes('mademoiselle') || lower === 'mlle') return 'Mlle';
  return value;
}

/**
 * Normalize regime social to standard format
 */
export function normalizeRegimeSocial(value?: string): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();

  if (lower.includes('tns') || lower.includes('travailleurs non salariés') || lower.includes('indépendants')) {
    return 'TNS';
  }
  if (lower.includes('général') || lower.includes('salari')) {
    return 'Général';
  }
  if (lower.includes('agricole') || lower.includes('msa')) {
    return 'Agricole';
  }
  if (lower.includes('alsace') || lower.includes('moselle')) {
    return 'Alsace-Moselle';
  }

  return value;
}

/**
 * Clean and validate email
 */
export function cleanEmail(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/([^\s<>]+@[^\s<>]+\.[^\s<>]+)/);
  return match ? match[1].toLowerCase() : undefined;
}

/**
 * Clean phone number
 */
export function cleanPhone(value?: string): string | undefined {
  if (!value) return undefined;
  // Remove all non-digit characters except leading +
  const cleaned = value.replace(/[^\d+]/g, '');
  return cleaned || undefined;
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
 * Check if string is a valid date format (DD/MM/YYYY)
 */
export function isValidDate(value: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

/**
 * Clean extracted value (remove &nbsp;, trim, etc.)
 */
export function cleanValue(value: string): string {
  return value
    .replace(/&nbsp;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if an object has any non-undefined values
 */
export function hasData(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(v => v !== undefined && v !== '');
}
