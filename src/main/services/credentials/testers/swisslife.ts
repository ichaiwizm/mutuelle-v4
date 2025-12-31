import type { Page, ElementHandle } from "playwright";
import { SwissLifeOneUrls } from "@/main/flows/config/swisslifeone.config";
import type { PlatformCredentials, CredentialsTestResult } from "../types";
import { TEST_TIMEOUT, createTestBrowser, handleTestError } from "./helpers";

async function navigateAndClickLogin(page: Page): Promise<void> {
  await page.goto(SwissLifeOneUrls.login, { timeout: TEST_TIMEOUT, waitUntil: 'networkidle' });
  const seConnecterBtn = page.getByRole('button', { name: /se connecter/i })
    .or(page.getByRole('link', { name: /se connecter/i }));
  await seConnecterBtn.first().click();
  await page.waitForURL(/adfs\.swisslife\.fr|login/, { timeout: TEST_TIMEOUT });
  await page.waitForLoadState('networkidle');
}

async function fillCredentialsAndSubmit(page: Page, creds: PlatformCredentials): Promise<void> {
  await page.getByRole('textbox', { name: /identifiant|username|email/i }).fill(creds.login);
  await page.getByRole('textbox', { name: /password|mot de passe/i }).fill(creds.password);
  await page.getByRole('button', { name: /m'identifie|connexion|submit|login/i }).click();
  await page.waitForLoadState('networkidle');
}

async function waitForResult(page: Page): Promise<{ success: boolean; errorText?: string }> {
  return Promise.race([
    page.waitForURL(/\/accueil/, { timeout: TEST_TIMEOUT })
      .then(() => ({ success: true })),
    page.waitForSelector("#errorText, .error-message, .adfs-error", { state: "visible", timeout: TEST_TIMEOUT })
      .then(async (el: ElementHandle | null) => ({
        success: false,
        errorText: (await el?.textContent())?.trim() || "Login failed"
      })),
  ]);
}

/**
 * Test SwissLife One credentials with headless browser
 */
export async function testSwissLifeOneCredentials(creds: PlatformCredentials): Promise<CredentialsTestResult> {
  let browser;
  try {
    const ctx = await createTestBrowser();
    browser = ctx.browser;

    await navigateAndClickLogin(ctx.page);
    await fillCredentialsAndSubmit(ctx.page, creds);
    const result = await waitForResult(ctx.page);

    if (result.success) return { ok: true };
    return { ok: false, error: "LOGIN_FAILED", message: result.errorText };
  } catch (err) {
    return handleTestError(err);
  } finally {
    if (browser) await browser.close();
  }
}
