/**
 * Mail module constants
 *
 * Centralized configuration values for the mail/Gmail integration.
 */

/**
 * Gmail API configuration
 */
export const GMAIL_API = {
  /** Gmail API version */
  VERSION: 'v1' as const,

  /** User ID for current authenticated user */
  USER_ID: 'me' as const,

  /** Message format for full message retrieval */
  MESSAGE_FORMAT: 'full' as const,
} as const;

/**
 * Gmail fetch and processing configuration
 */
export const GMAIL_CONFIG = {
  /** Maximum number of messages to fetch from Gmail API in one request */
  MAX_RESULTS: 500,

  /** Default concurrency for parallel message processing */
  DEFAULT_CONCURRENCY: 10,

  /** Interval for progress logging (every N emails) */
  PROGRESS_LOG_INTERVAL: 100,
} as const;

/**
 * OAuth token configuration
 */
export const OAUTH_CONFIG = {
  /** Token expiry duration in milliseconds (1 hour) */
  TOKEN_EXPIRY_MS: 3600_000,

  /** OAuth provider name for Google */
  PROVIDER_GOOGLE: 'google' as const,
} as const;

/**
 * MIME type constants
 */
export const MIME_TYPES = {
  /** Plain text MIME type */
  TEXT_PLAIN: 'text/plain',

  /** HTML MIME type */
  TEXT_HTML: 'text/html',
} as const;

/**
 * Test configuration
 */
export const TEST_CONFIG = {
  /** Default timeout for Gmail live tests (2 minutes) */
  GMAIL_LIVE_TEST_TIMEOUT_MS: 120000,

  /** Concurrency for test execution */
  TEST_CONCURRENCY: 20,
} as const;
