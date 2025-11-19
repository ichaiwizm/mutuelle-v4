/**
 * Fixtures Playwright pour les tests SwissLife One
 * Permet de réutiliser les étapes communes (auth, navigation)
 */
import { test as base } from '@playwright/test';
import { SwissLifeOneInstances } from '../../src/main/flows/registry';

type SwissLifeOneFixtures = {
  /** Page authentifiée sur SwissLife One */
  authenticatedPage: void;
  /** Page sur le formulaire SLSIS (iframe chargée) */
  formPage: void;
};

export const test = base.extend<SwissLifeOneFixtures>({
  /**
   * Fixture: page authentifiée
   * Effectue le login SwissLife One (ADFS/SAML)
   */
  authenticatedPage: async ({ page }, use) => {
    console.log('\n🔐 [FIXTURE] Authentification SwissLife One...');
    const auth = SwissLifeOneInstances.getAuth();
    await auth.login(page);
    console.log('✅ [FIXTURE] Authentifié');
    await use();
  },

  /**
   * Fixture: page sur le formulaire SLSIS
   * Dépend de authenticatedPage + effectue la navigation vers l'iframe
   * ATTENTION: Cette étape est TRÈS longue (45+ secondes pour charger l'iframe)
   */
  formPage: async ({ page, authenticatedPage }, use) => {
    console.log('\n🧭 [FIXTURE] Navigation vers formulaire SLSIS...');
    const nav = SwissLifeOneInstances.getNavigationStep();
    await nav.execute(page);
    console.log('✅ [FIXTURE] Sur le formulaire (iframe chargée)');
    await use();
  },
});

export { expect } from '@playwright/test';
