import { chromium, type Page } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { SwissLifeOneAuth } from "@/main/flows/platforms/swisslifeone/lib/SwissLifeOneAuth";
import { setupCookieInterception as setupSwissLifeCookieInterception } from "@/main/flows/platforms/swisslifeone/lib/cookie-interceptor";
import { getBundledChromiumPath } from "@/main/flows/engine/pool/browser/chromiumPath";
import type { PlatformCredentials, CredentialsTestResult } from "../types";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

const TEST_TIMEOUT = 30000; // 30 seconds

/**
 * Test SwissLife One credentials with headless browser
 */
export async function testSwissLifeOneCredentials(
  creds: PlatformCredentials
): Promise<CredentialsTestResult> {
  let browser;
  let page: Page | undefined;
  try {
    const executablePath = getBundledChromiumPath();
    browser = await chromium.launch({ headless: true, executablePath });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    page = await context.newPage();

    await setupSwissLifeCookieInterception(page, { debug: false });

    const auth = new SwissLifeOneAuth({
      username: creds.login,
      password: creds.password,
    });

    await auth.navigateToLogin(page);
    await auth.clickSeConnecter(page);
    await auth.waitForAdfsPage(page);
    await auth.fillCredentials(page);
    await auth.submitLogin(page);

    // Wait for either dashboard (success) or error
    const result = await Promise.race([
      page
        .waitForURL(/\/accueil/, { timeout: TEST_TIMEOUT })
        .then(() => ({ success: true as const })),
      page
        .waitForSelector("#errorText, .error-message, .adfs-error", {
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
