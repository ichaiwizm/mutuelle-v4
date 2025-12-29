import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { EntoriaUrls, ENTORIA_LOGIN_SELECTORS } from "@/main/flows/platforms/entoria/lib/EntoriaAuth";
import { getBundledChromiumPath } from "@/main/flows/engine/pool/browser/chromiumPath";
import type { PlatformCredentials, CredentialsTestResult } from "../types";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

const TEST_TIMEOUT = 30000; // 30 seconds

/**
 * Test Entoria credentials with headless browser
 * Entoria requires: courtierCode + username + password
 */
export async function testEntoriaCredentials(
  creds: PlatformCredentials
): Promise<CredentialsTestResult> {
  // Entoria requires courtierCode
  if (!creds.courtierCode) {
    return {
      ok: false,
      error: "NO_CREDENTIALS",
      message: "Entoria requires a courtier code (Code Courtier)",
    };
  }

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
    await page.goto(EntoriaUrls.login, { timeout: TEST_TIMEOUT });

    // Wait for login page to load (Angular app)
    await page.waitForLoadState("networkidle");
    await page.getByRole("heading", { name: "connectez-vous" }).waitFor({
      state: "visible",
      timeout: TEST_TIMEOUT,
    });

    // Fill credentials using role-based selectors (Angular Material)
    // 1. Code courtier
    const courtierInput = page.getByRole("textbox", { name: ENTORIA_LOGIN_SELECTORS.courtierCodeLabel });
    await courtierInput.fill(creds.courtierCode);

    // 2. Identifiant
    const usernameInput = page.getByRole("textbox", { name: ENTORIA_LOGIN_SELECTORS.usernameLabel });
    await usernameInput.fill(creds.login);

    // 3. Mot de passe
    const passwordInput = page.getByRole("textbox", { name: ENTORIA_LOGIN_SELECTORS.passwordLabel });
    await passwordInput.fill(creds.password);

    // Wait for Angular validation
    await page.waitForTimeout(500);

    // Submit
    const submitBtn = page.getByRole("button", { name: "Se connecter" });
    await submitBtn.waitFor({ state: "visible", timeout: 5000 });

    // Wait for button to be enabled
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        return btn && !btn.disabled;
      },
      { timeout: TEST_TIMEOUT }
    );

    await submitBtn.click();
    await page.waitForLoadState("networkidle");

    // Wait for either success (redirect to home) or error
    const result = await Promise.race([
      // Success: Redirected away from login page
      page
        .waitForURL((url) => !url.href.includes("/login"), {
          timeout: TEST_TIMEOUT,
        })
        .then(() => ({ success: true as const })),

      // Failure: Error message appears (snackbar or inline error)
      page
        .waitForSelector("snack-bar-container, .mat-mdc-snack-bar-container, .error-message, mat-error", {
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
