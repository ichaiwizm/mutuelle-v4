import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { getBundledChromiumPath } from "@/main/flows/engine/pool/browser/chromiumPath";
import type { CredentialsTestResult } from "../../types";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

export const TEST_TIMEOUT = 30000; // 30 seconds

export interface BrowserTestContext {
  browser: ReturnType<typeof chromium.launch> extends Promise<infer T> ? T : never;
  page: Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newContext"]>>["newPage"] extends () => Promise<infer P> ? P : never;
}

/**
 * Launch browser and create page for credential testing
 */
export async function createTestBrowser(): Promise<BrowserTestContext> {
  const browser = await chromium.launch({
    headless: true,
    executablePath: getBundledChromiumPath(),
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  return { browser, page };
}

/**
 * Handle common test errors and return appropriate result
 */
export function handleTestError(err: unknown): CredentialsTestResult {
  const message = err instanceof Error ? err.message : "Unknown error";

  if (message.includes("Timeout")) {
    return {
      ok: false,
      error: "TIMEOUT",
      message: "Login test timed out",
    };
  }

  return {
    ok: false,
    error: "BROWSER_ERROR",
    message,
  };
}
