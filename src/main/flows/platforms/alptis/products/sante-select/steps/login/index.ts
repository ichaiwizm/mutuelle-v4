import type { Page } from 'playwright';
import { AlptisAuth, type AlptisAuthConfig } from '../../../../lib';

/**
 * Étape de connexion pour Alptis Santé Select
 *
 * Cette étape se charge de :
 * 1. Naviguer vers la page de connexion Alptis
 * 2. Vérifier que les champs de connexion sont accessibles
 */
export class LoginStep {
  private auth: AlptisAuth;

  constructor(config: AlptisAuthConfig) {
    this.auth = new AlptisAuth(config);
  }

  /**
   * Exécute l'étape de connexion
   * Vérifie uniquement que la page de login est accessible et que les champs sont visibles
   */
  async execute(page: Page): Promise<void> {
    // Naviguer vers la page de connexion
    await this.auth.navigateToLogin(page);

    // Vérifier que les champs de connexion sont accessibles
    await this.auth.waitForLoginFields(page);
  }
}
