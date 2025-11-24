import type { Page } from 'playwright';
import type { FlowLogger } from '../../../engine/FlowLogger';
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

  async navigateToLogin(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Navigating to SwissLife One login page', { url: SwissLifeOneUrls.login });
    await page.goto(SwissLifeOneUrls.login, {
      waitUntil: 'networkidle',
      timeout: SwissLifeOneTimeouts.navigationIdle,
    });
  }

  async clickSeConnecter(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Clicking "Se connecter" button');
    try {
      await page.getByRole('button', { name: /se connecter/i }).click({ timeout: 5000 });
    } catch {
      try {
        await page.getByRole('link', { name: /se connecter/i }).click({ timeout: 5000 });
      } catch {
        await page.locator(SwissLifeOneAuthSelectors.seConnecterButton).first().click();
      }
    }

    logger?.debug('Waiting for ADFS redirect');
    await page.waitForURL(/adfs\.swisslife\.fr/, {
      timeout: SwissLifeOneTimeouts.redirections,
    });
  }

  async waitForAdfsPage(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Waiting for ADFS login page to load');
    await page.getByRole(SwissLifeOneAuthSelectors.usernameField, {
      name: SwissLifeOneAuthSelectors.usernameName,
    }).waitFor({
      state: 'visible',
      timeout: SwissLifeOneTimeouts.elementVisible,
    });
    logger?.debug('ADFS login page loaded');
  }

  async fillCredentials(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Filling login credentials', { username: this.config.username });
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

  async submitLogin(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Submitting login form');
    const submitButton = page.getByRole(SwissLifeOneAuthSelectors.submitButton, {
      name: SwissLifeOneAuthSelectors.submitText,
    });
    await submitButton.click();
  }

  async waitForDashboard(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Waiting for dashboard to load');
    await page.waitForURL(/\/accueil/, {
      timeout: SwissLifeOneTimeouts.dashboardLoad,
    });
    await page.waitForLoadState('networkidle', {
      timeout: SwissLifeOneTimeouts.navigationIdle,
    });
    logger?.debug('Dashboard loaded successfully');
  }

  async login(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Starting SwissLife One authentication');
    await setupCookieInterception(page, { debug: process.env.SWISSLIFE_DEBUG_COOKIES === '1' });
    await this.navigateToLogin(page, logger);
    await this.clickSeConnecter(page, logger);
    await this.waitForAdfsPage(page, logger);
    await this.fillCredentials(page, logger);
    await this.submitLogin(page, logger);
    await this.waitForDashboard(page, logger);
    logger?.info('SwissLife One authentication completed');
  }
}
