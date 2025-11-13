/**
 * Debug utility for conditional logging
 * Logs are only displayed when DEBUG environment variable is set
 */

const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';

export function debug(...args: any[]): void {
  if (DEBUG) {
    console.log(...args);
  }
}

export function debugWarn(...args: any[]): void {
  if (DEBUG) {
    console.warn(...args);
  }
}

export function debugError(...args: any[]): void {
  if (DEBUG) {
    console.error(...args);
  }
}
