/**
 * Date utilities for converting between French (DD/MM/YYYY) and ISO (YYYY-MM-DD) formats
 */

/**
 * Convert French date format (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
 * Used for HTML date inputs which require ISO format
 */
export function frenchToISO(date: string | undefined): string {
  if (!date) return ''

  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  // French format DD/MM/YYYY
  const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (match) {
    const [, day, month, year] = match
    return `${year}-${month}-${day}`
  }

  return ''
}

/**
 * Convert ISO date format (YYYY-MM-DD) to French format (DD/MM/YYYY)
 * Used for storing dates in the database
 */
export function isoToFrench(date: string | undefined): string {
  if (!date) return ''

  // Already in French format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    return date
  }

  // ISO format YYYY-MM-DD
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    const [, year, month, day] = match
    return `${day}/${month}/${year}`
  }

  return ''
}

/**
 * Parse a French date string (DD/MM/YYYY) into a Date object
 */
export function parseFrenchDate(date: string | undefined): Date | null {
  if (!date) return null

  // French format DD/MM/YYYY
  const frenchMatch = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (frenchMatch) {
    const [, day, month, year] = frenchMatch
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  // ISO format YYYY-MM-DD
  const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  return null
}

/**
 * Format a date string (French or ISO) for display in French locale
 */
export function formatFrenchDate(date: string | undefined): string | null {
  if (!date) return null

  const parsed = parseFrenchDate(date)
  if (!parsed || isNaN(parsed.getTime())) {
    return date // Return original if parsing fails
  }

  return parsed.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
