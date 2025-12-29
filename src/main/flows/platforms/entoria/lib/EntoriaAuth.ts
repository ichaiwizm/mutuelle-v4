import type { Page } from 'playwright';
import type { FlowLogger } from '../../../engine/FlowLogger';

/**
 * Configuration de l'authentification Entoria
 */
export interface EntoriaAuthConfig {
  username: string;
  password: string;
  courtierCode: string;
}

/**
 * URLs Entoria
 */
export const EntoriaUrls = {
  login: 'https://espacecourtier.entoria.fr/login',
  home: 'https://espacecourtier.entoria.fr/',
} as const;

/**
 * Sélecteurs pour la page de connexion Entoria (Angular Material)
 * Utilise des sélecteurs par aria-label/role pour plus de stabilité
 */
export const ENTORIA_LOGIN_SELECTORS = {
  // Angular Material utilise des labels flottants, pas des placeholders HTML
  courtierCode: 'input[formcontrolname="codeCourtier"]',
  username: 'input[formcontrolname="identifiant"]',
  password: 'input[formcontrolname="password"]',
  submitButton: 'button[type="submit"]',
  // Fallback avec les labels
  courtierCodeLabel: 'Code courtier',
  usernameLabel: 'identifiant',
  passwordLabel: 'Mot de passe',
} as const;

/**
 * Classe de gestion de l'authentification Entoria
 */
export class EntoriaAuth {
  constructor(private config: EntoriaAuthConfig) {}

  /**
   * Navigue vers la page de connexion Entoria
   */
  async navigateToLogin(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Navigating to Entoria login page', { url: EntoriaUrls.login });
    await page.goto(EntoriaUrls.login);
  }

  /**
   * Vérifie que les champs de connexion sont accessibles
   */
  async waitForLoginFields(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Waiting for login fields to be visible');
    await page.waitForLoadState('domcontentloaded');
    // Attendre le formulaire de connexion avec le titre
    await page.getByRole('heading', { name: 'connectez-vous' }).waitFor({ state: 'visible', timeout: 10000 });
    logger?.debug('Login page loaded');
  }

  /**
   * Remplit les champs de connexion avec les credentials
   * Entoria requiert : code courtier + identifiant + mot de passe
   */
  async fillCredentials(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Filling login credentials', {
      username: this.config.username,
      courtierCode: this.config.courtierCode
    });

    // Angular Material utilise des labels flottants - on utilise getByRole
    // 1. Code courtier
    const courtierInput = page.getByRole('textbox', { name: ENTORIA_LOGIN_SELECTORS.courtierCodeLabel });
    await courtierInput.fill(this.config.courtierCode);

    // 2. Identifiant
    const usernameInput = page.getByRole('textbox', { name: ENTORIA_LOGIN_SELECTORS.usernameLabel });
    await usernameInput.fill(this.config.username);

    // 3. Mot de passe
    const passwordInput = page.getByRole('textbox', { name: ENTORIA_LOGIN_SELECTORS.passwordLabel });
    await passwordInput.fill(this.config.password);

    // Attendre que Angular valide les champs et active le bouton
    await page.waitForTimeout(500);
  }

  /**
   * Soumet le formulaire de connexion
   */
  async submitLogin(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.debug('Submitting login form');
    const submitBtn = page.getByRole('button', { name: 'Se connecter' });

    // Attendre que le bouton soit activé (Angular validation)
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 });

    // Attendre que le bouton ne soit plus disabled
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        return btn && !btn.disabled;
      },
      { timeout: 10000 }
    );

    await submitBtn.click();
    await page.waitForLoadState('domcontentloaded');

    // Attendre que la page soit bien redirigée après connexion
    await page.waitForTimeout(2000);
  }

  /**
   * Effectue la connexion complète
   */
  async login(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Starting Entoria authentication');
    await this.navigateToLogin(page, logger);
    await this.waitForLoginFields(page, logger);
    await this.fillCredentials(page, logger);
    await this.submitLogin(page, logger);
    logger?.info('Entoria authentication completed');
  }
}
