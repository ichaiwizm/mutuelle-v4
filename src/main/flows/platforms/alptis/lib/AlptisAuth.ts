import type { Page } from 'playwright';
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
  async navigateToLogin(page: Page): Promise<void> {
    await page.goto(AlptisUrls.login);
  }

  /**
   * Vérifie que les champs de connexion sont accessibles
   * Attend que les champs username et password soient visibles
   */
  async waitForLoginFields(page: Page): Promise<void> {
    await page.waitForSelector(ALPTIS_LOGIN_SELECTORS.username, { state: 'visible' });
    await page.waitForSelector(ALPTIS_LOGIN_SELECTORS.password, { state: 'visible' });
  }

  /**
   * Remplit les champs de connexion avec les credentials
   */
  async fillCredentials(page: Page): Promise<void> {
    await page.fill(ALPTIS_LOGIN_SELECTORS.username, this.config.username);
    await page.fill(ALPTIS_LOGIN_SELECTORS.password, this.config.password);
  }

  /**
   * Soumet le formulaire de connexion en cliquant sur le bouton
   */
  async submitLogin(page: Page): Promise<void> {
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
  async login(page: Page): Promise<void> {
    await setupAxeptioInterception(page, { debug: process.env.ALPTIS_DEBUG_COOKIES === '1' });
    await this.navigateToLogin(page);
    await this.waitForLoginFields(page);
    await this.fillCredentials(page);
    await this.submitLogin(page);
  }
}
