import type { Page } from 'playwright';
import {
  SwissLifeOneUrls,
  SwissLifeOneAuthSelectors,
  SwissLifeOneTimeouts,
} from '../../../config';
import { setupCookieInterception } from './cookie-interceptor';

export interface SwissLifeOneAuthConfig {
  username: string;
  password: string;
}

/**
 * Classe de gestion de l'authentification SwissLife One
 * Flow: Page d'accueil → Clic "Se connecter" → ADFS/SAML → Dashboard
 */
export class SwissLifeOneAuth {
  constructor(private config: SwissLifeOneAuthConfig) {}

  async navigateToLogin(page: Page): Promise<void> {
    await page.goto(SwissLifeOneUrls.login, {
      waitUntil: 'networkidle',
      timeout: SwissLifeOneTimeouts.navigationIdle,
    });
  }

  async clickSeConnecter(page: Page): Promise<void> {
    try {
      await page.getByRole('button', { name: /se connecter/i }).click({ timeout: 5000 });
    } catch {
      try {
        await page.getByRole('link', { name: /se connecter/i }).click({ timeout: 5000 });
      } catch {
        await page.locator(SwissLifeOneAuthSelectors.seConnecterButton).first().click();
      }
    }

    await page.waitForURL(/adfs\.swisslife\.fr/, {
      timeout: SwissLifeOneTimeouts.redirections,
    });
  }

  async waitForAdfsPage(page: Page): Promise<void> {
    await page.getByRole(SwissLifeOneAuthSelectors.usernameField, {
      name: SwissLifeOneAuthSelectors.usernameName,
    }).waitFor({
      state: 'visible',
      timeout: SwissLifeOneTimeouts.elementVisible,
    });
  }

  async fillCredentials(page: Page): Promise<void> {
    const usernameField = page.getByRole(SwissLifeOneAuthSelectors.usernameField, {
      name: SwissLifeOneAuthSelectors.usernameName,
    });
    await usernameField.fill(this.config.username);
    await page.waitForTimeout(SwissLifeOneTimeouts.afterType);

    const passwordField = page.getByRole(SwissLifeOneAuthSelectors.passwordField, {
      name: SwissLifeOneAuthSelectors.passwordName,
    });
    await passwordField.fill(this.config.password);
    await page.waitForTimeout(SwissLifeOneTimeouts.afterType);
  }

  async submitLogin(page: Page): Promise<void> {
    const submitButton = page.getByRole(SwissLifeOneAuthSelectors.submitButton, {
      name: SwissLifeOneAuthSelectors.submitText,
    });
    await submitButton.click();
  }

  async waitForDashboard(page: Page): Promise<void> {
    await page.waitForURL(/\/accueil/, {
      timeout: SwissLifeOneTimeouts.dashboardLoad,
    });
    await page.waitForLoadState('networkidle', {
      timeout: SwissLifeOneTimeouts.navigationIdle,
    });
  }

  async login(page: Page): Promise<void> {
    await setupCookieInterception(page, { debug: process.env.SWISSLIFE_DEBUG_COOKIES === '1' });
    await this.navigateToLogin(page);
    await this.clickSeConnecter(page);
    await this.waitForAdfsPage(page);
    await this.fillCredentials(page);
    await this.submitLogin(page);
    await this.waitForDashboard(page);
  }
}
