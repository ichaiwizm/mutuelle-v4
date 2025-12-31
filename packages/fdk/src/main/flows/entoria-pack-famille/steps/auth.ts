/**
 * Authentication step for Entoria Pack Famille
 */
import type { Page } from 'playwright';
import { SELECTORS } from '../selectors';
import { config } from '../config';

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthStepResult {
  success: boolean;
  error?: string;
}

/**
 * Execute authentication on Entoria portal
 */
export async function executeAuth(
  page: Page,
  credentials: AuthCredentials
): Promise<AuthStepResult> {
  try {
    // Navigate to login page
    await page.goto(config.loginUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Fill username
    const usernameInput = page.locator(SELECTORS.auth.usernameInput).first();
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill(credentials.username);

    // Fill password
    const passwordInput = page.locator(SELECTORS.auth.passwordInput).first();
    await passwordInput.fill(credentials.password);

    // Submit
    const submitBtn = page.locator(SELECTORS.auth.submitButton).first();
    await submitBtn.click();

    // Wait for dashboard
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Verify login success
    const dashboardVisible = await page
      .locator(SELECTORS.auth.dashboardIndicator)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!dashboardVisible) {
      // Check URL for success indicators
      const url = page.url();
      if (!url.includes('accueil') && !url.includes('dashboard')) {
        return { success: false, error: 'Login failed - dashboard not found' };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Auth step definition for flow */
export const authStep = {
  id: 'entoria-auth',
  name: 'Authentication Entoria',
  type: 'auth' as const,
  execute: executeAuth,
};
