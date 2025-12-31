import type { Browser, BrowserContext, LaunchOptions } from "playwright";

/** Options for creating a browser context */
export type CreateContextOptions = {
  /** If true, use visible (non-headless) browser */
  visible?: boolean;
};

/** Configuration for BrowserManager */
export type BrowserManagerOptions = LaunchOptions;

/** Browser instance type (for internal use) */
export type BrowserType = "headless" | "visible";

/** State of a browser pool */
export interface BrowserPoolState {
  browser: Browser | null;
  contexts: Set<BrowserContext>;
}

// Timeouts for browser operations
export const HEALTH_CHECK_TIMEOUT_MS = 5000;
export const CONTEXT_CREATION_TIMEOUT_MS = 30000;
export const CLOSE_TIMEOUT_MS = 5000;
