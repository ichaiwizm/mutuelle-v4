/**
 * Fixtures Playwright pour les tests SwissLife One
 * Permet de réutiliser les étapes communes (auth, navigation)
 */
import { test as base } from '@playwright/test';
import { SwissLifeOneInstances } from '../../src/main/flows/registry';
import type { SwissLifeOneFormData } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/types';

type SwissLifeOneFixtures = {
  /** Page authentifiée sur SwissLife One */
  authenticatedPage: void;
  /** Page sur le formulaire SLSIS (iframe chargée) */
  formPage: void;
  /** Données de test pour le formulaire */
  testData: SwissLifeOneFormData;
  /** Formulaire avec Step 1 - Section 1 remplie */
  formWithStep1Section1: void;
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

  /**
   * Fixture: données de test
   * Fournit des données minimales pour tester le formulaire
   */
  testData: async ({}, use) => {
    const data: SwissLifeOneFormData = {
      projet: {
        nom_projet: 'Projet Test SwissLife',
      },
      besoins: {
        besoin_couverture_individuelle: true,
        besoin_indemnites_journalieres: false,
      },
      type_simulation: 'INDIVIDUEL',
      assure_principal: {
        date_naissance: '01/01/1980',
        departement_residence: '75',
        regime_social: 'REGIME_GENERAL_CPAM',
        profession: 'MEDECIN',
        statut: 'SALARIE',
      },
      gammes_options: {
        gamme: 'SWISSLIFE_SANTE',
        date_effet: '01/01/2025',
        loi_madelin: false,
        reprise_iso_garanties: true,
        resiliation_a_effectuer: false,
      },
    };
    await use(data);
  },

  /**
   * Fixture: formulaire avec Step 1 - Section 1 remplie
   * Dépend de formPage + testData
   */
  formWithStep1Section1: async ({ page, formPage, testData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Step 1 - Section 1...');
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    const formFill = SwissLifeOneInstances.getFormFillStep();
    await formFill.fillStep1(frame, testData);
    console.log('✅ [FIXTURE] Step 1 - Section 1 remplie');
    await use();
  },
});

export { expect } from '@playwright/test';
