import type { Page } from "playwright";
import type { PlatformCredentials, CredentialsTestResult } from "../types";
import { TEST_TIMEOUT, createTestBrowser, handleTestError } from "./helpers";

const EntoriaUrls = { login: 'https://espace-partenaires.entoria.fr/login' } as const;

const SELECTORS = {
  courtierCodeLabel: 'Code courtier',
  usernameLabel: 'Identifiant',
  passwordLabel: 'Mot de passe',
} as const;

async function fillEntoriaForm(page: Page, creds: PlatformCredentials): Promise<void> {
  await page.goto(EntoriaUrls.login, { timeout: TEST_TIMEOUT });
  await page.waitForLoadState("networkidle");
  await page.getByRole("heading", { name: "connectez-vous" }).waitFor({ state: "visible", timeout: TEST_TIMEOUT });

  await page.getByRole("textbox", { name: SELECTORS.courtierCodeLabel }).fill(creds.courtierCode!);
  await page.getByRole("textbox", { name: SELECTORS.usernameLabel }).fill(creds.login);
  await page.getByRole("textbox", { name: SELECTORS.passwordLabel }).fill(creds.password);
  await page.waitForTimeout(500);
}

async function submitAndWaitResult(page: Page): Promise<{ success: boolean; errorText?: string }> {
  const submitBtn = page.getByRole("button", { name: "Se connecter" });
  await submitBtn.waitFor({ state: "visible", timeout: 5000 });
  await page.waitForFunction(() => {
    const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    return btn && !btn.disabled;
  }, { timeout: TEST_TIMEOUT });

  await submitBtn.click();
  await page.waitForLoadState("networkidle");

  return Promise.race([
    page.waitForURL((url) => !url.href.includes("/login"), { timeout: TEST_TIMEOUT })
      .then(() => ({ success: true })),
    page.waitForSelector("snack-bar-container, .mat-mdc-snack-bar-container, .error-message, mat-error", { state: "visible", timeout: TEST_TIMEOUT })
      .then(async (el) => ({ success: false, errorText: (await el.textContent())?.trim() || "Login failed" })),
  ]);
}

/**
 * Test Entoria credentials with headless browser
 */
export async function testEntoriaCredentials(creds: PlatformCredentials): Promise<CredentialsTestResult> {
  if (!creds.courtierCode) {
    return { ok: false, error: "NO_CREDENTIALS", message: "Entoria requires a courtier code (Code Courtier)" };
  }

  let browser;
  try {
    const ctx = await createTestBrowser();
    browser = ctx.browser;

    await fillEntoriaForm(ctx.page, creds);
    const result = await submitAndWaitResult(ctx.page);

    if (result.success) return { ok: true };
    return { ok: false, error: "LOGIN_FAILED", message: result.errorText };
  } catch (err) {
    return handleTestError(err);
  } finally {
    if (browser) await browser.close();
  }
}
