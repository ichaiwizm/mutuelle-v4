import type { Page } from 'playwright';

/**
 * Configuration de l'authentification Alptis
 */
export interface AlptisAuthConfig {
  username: string;
  password: string;
}

/**
 * URLs de la plateforme Alptis
 */
export const ALPTIS_URLS = {
  login: 'https://pro.alptis.org/',
} as const;

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
    await page.goto(ALPTIS_URLS.login);
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
   * Effectue la connexion complète
   * 1. Navigue vers la page de login
   * 2. Attend que les champs soient visibles
   * 3. Remplit les credentials
   */
  async login(page: Page): Promise<void> {
    await this.navigateToLogin(page);
    await this.waitForLoginFields(page);
    await this.fillCredentials(page);
  }
}
