import type { Page } from 'playwright';
import type { FlowLogger } from '../../../engine/FlowLogger';
import { setupAxeptioInterception } from './cookie-interceptor';
import { AlptisUrls } from '../../../config';

/**
 * Configuration de l'authentification Alptis
 */
export interface AlptisAuthConfig {
  username: string;
  password: string;
}

/**
 * Sélecteurs pour la page de connexion Alptis
 * Découverts via inspection de la page réelle (Keycloak auth)
 *
 * Page de login : https://pro.alptis.org/auth/realms/alptis-distribution/protocol/openid-connect/auth
 * Système d'auth : Keycloak
 */
export const ALPTIS_LOGIN_SELECTORS = {
  username: '#username',
  password: '#password',
  submitButton: 'button[name="login"]',
} as const;

/**
 * Classe de gestion de l'authentification Alptis
 */
export class AlptisAuth {
  constructor(private config: AlptisAuthConfig) {}

  /**
   * Navigue vers la page de connexion Alptis
   * L'URL redirige automatiquement vers la page de login
   */
  async navigateToLogin(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Navigating to Alptis login page', { url: AlptisUrls.login });
    await page.goto(AlptisUrls.login);
  }

  /**
   * Vérifie que les champs de connexion sont accessibles
   * Attend que les champs username et password soient visibles
   */
  async waitForLoginFields(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Waiting for login fields to be visible');
    await page.waitForSelector(ALPTIS_LOGIN_SELECTORS.username, { state: 'visible' });
    await page.waitForSelector(ALPTIS_LOGIN_SELECTORS.password, { state: 'visible' });
    logger?.debug('Login fields are now visible');
  }

  /**
   * Remplit les champs de connexion avec les credentials
   */
  async fillCredentials(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Filling login credentials', { username: this.config.username });
    await page.fill(ALPTIS_LOGIN_SELECTORS.username, this.config.username);
    await page.fill(ALPTIS_LOGIN_SELECTORS.password, this.config.password);
  }

  /**
   * Soumet le formulaire de connexion en cliquant sur le bouton
   */
  async submitLogin(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Submitting login form');
    await page.click(ALPTIS_LOGIN_SELECTORS.submitButton);
  }

  /**
   * Effectue la connexion complète
   * 1. Installe l'interception Axeptio (bannières cookies) page + context
   * 2. Navigue vers la page de login
   * 3. Attend que les champs soient visibles
   * 4. Remplit les credentials
   * 5. Clique sur le bouton de connexion
   */
  async login(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Starting Alptis authentication');
    await setupAxeptioInterception(page, { debug: process.env.ALPTIS_DEBUG_COOKIES === '1' });
    await this.navigateToLogin(page, logger);
    await this.waitForLoginFields(page, logger);
    await this.fillCredentials(page, logger);
    await this.submitLogin(page, logger);
    logger?.info('Alptis authentication completed');
  }
}
