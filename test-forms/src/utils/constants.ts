/**
 * Constants for timeouts, delays, and magic numbers
 * Centralized to avoid duplication and improve maintainability
 */

/**
 * Timeouts for various operations (in milliseconds)
 */
export const TIMEOUTS = {
  /** Short timeout for quick operations (2 seconds) */
  SHORT: 2000,
  /** Medium timeout for normal operations (3 seconds) */
  MEDIUM: 3000,
  /** Standard timeout (5 seconds) */
  STANDARD: 5000,
  /** Long timeout for slow operations (10 seconds) */
  LONG: 10000,
  /** Extended timeout for very slow operations (15 seconds) */
  EXTENDED: 15000,
} as const;

/**
 * Coverage level mappings
 * Maps numeric levels (1-4) to their corresponding tier names
 */
export const COVERAGE_LEVELS = {
  ECONOMICAL: 1,    // Niveau économique/basique
  COMFORT: 2,       // Niveau confort
  PREMIUM: 3,       // Niveau premium
  EXCELLENCE: 4,    // Niveau excellence/haut de gamme
} as const;

/**
 * Coverage level names for display
 */
export const COVERAGE_LEVEL_NAMES: Record<number, string> = {
  1: 'Essentiel',
  2: 'Confort',
  3: 'Premium',
  4: 'Excellence',
} as const;

/**
 * Default date offset values (in days)
 */
export const DATE_OFFSETS = {
  /** Default date offset for standard product (30 days) */
  STANDARD_PRODUCT: 30,
  /** Default date offset for premium product (14 days) */
  PREMIUM_PRODUCT: 14,
  /** Minimum date offset for validation (7 days) */
  MINIMUM_REQUIRED: 7,
} as const;

/**
 * Validation constraints
 */
export const VALIDATION = {
  /** Minimum age for subscriber (18 years) */
  MIN_AGE_YEARS: 18,
  /** Phone number length (French format) */
  PHONE_LENGTH: 10,
  /** Postal code length (French format) */
  POSTAL_CODE_LENGTH: 5,
} as const;

/**
 * Port numbers for services
 */
export const PORTS = {
  /** Test server port */
  TEST_SERVER: 3100,
} as const;
