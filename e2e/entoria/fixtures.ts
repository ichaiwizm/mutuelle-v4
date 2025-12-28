/**
 * Fixtures Playwright pour les tests Entoria Pack Famille
 */
import { test as base } from '@playwright/test';
import { EntoriaAuth, EntoriaUrls } from '../../src/main/flows/platforms/entoria/lib';

/**
 * Récupère les credentials Entoria depuis les variables d'environnement
 */
export function getEntoriaCredentials() {
  const username = process.env.ENTORIA_USERNAME;
  const password = process.env.ENTORIA_PASSWORD;
  const courtierCode = process.env.ENTORIA_COURTIER_CODE;

  if (!username || !password || !courtierCode) {
    throw new Error('ENTORIA_USERNAME, ENTORIA_PASSWORD and ENTORIA_COURTIER_CODE must be set in .env');
  }

  return { username, password, courtierCode };
}

type EntoriaFixtures = {
  /** Page authentifiée sur Entoria */
  authenticatedPage: void;
  /** Instance EntoriaAuth */
  auth: EntoriaAuth;
};

export const test = base.extend<EntoriaFixtures>({
  /**
   * Fixture: instance EntoriaAuth configurée
   */
  auth: async ({}, use) => {
    const credentials = getEntoriaCredentials();
    const auth = new EntoriaAuth(credentials);
    await use(auth);
  },

  /**
   * Fixture: page authentifiée
   * Effectue le login Entoria
   */
  authenticatedPage: async ({ page, auth }, use) => {
    console.log('\n🔐 [FIXTURE] Authentification Entoria...');
    await auth.login(page);
    console.log('✅ [FIXTURE] Authentifié');
    await use();
  },
});

export { expect } from '@playwright/test';
