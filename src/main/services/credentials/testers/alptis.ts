import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { AlptisUrls } from "@/main/flows/config/alptis.config";
import { getBundledChromiumPath } from "@/main/flows/engine/pool/browser/chromiumPath";
import type { PlatformCredentials, CredentialsTestResult } from "../types";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

const TEST_TIMEOUT = 30000; // 30 seconds

// Alptis login page selectors
const ALPTIS_LOGIN_SELECTORS = {
  username: '#username',
  password: '#password',
  submitButton: 'input[type="submit"], button[type="submit"]',
} as const;

/**
 * Test Alptis credentials with headless browser
 */
export async function testAlptisCredentials(
  creds: PlatformCredentials
): Promise<CredentialsTestResult> {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: getBundledChromiumPath(),
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    // Navigate to login page
    await page.goto(AlptisUrls.login, { timeout: TEST_TIMEOUT });

    // Wait for login fields
    await page.waitForSelector(ALPTIS_LOGIN_SELECTORS.username, {
      state: "visible",
      timeout: TEST_TIMEOUT,
    });

    // Fill credentials
    await page.fill(ALPTIS_LOGIN_SELECTORS.username, creds.login);
    await page.fill(ALPTIS_LOGIN_SELECTORS.password, creds.password);

    // Submit
    await page.click(ALPTIS_LOGIN_SELECTORS.submitButton);

    // Wait for either success (redirect away from auth) or error
    const result = await Promise.race([
      // Success: We're no longer on the auth page
      page
        .waitForURL((url) => !url.href.includes("/auth/"), {
          timeout: TEST_TIMEOUT,
        })
        .then(() => ({ success: true as const })),

      // Failure: Error message appears on the page
      page
        .waitForSelector(".kc-feedback-text, .alert-error, #input-error", {
          state: "visible",
          timeout: TEST_TIMEOUT,
        })
        .then(async (el) => {
          const text = await el.textContent();
          return { success: false as const, errorText: text?.trim() || "Login failed" };
        }),
    ]);

    if (result.success) {
      return { ok: true };
    } else {
      return {
        ok: false,
        error: "LOGIN_FAILED",
        message: result.errorText,
      };
    }
  } catch (err) {
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
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
