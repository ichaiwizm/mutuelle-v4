/**
 * Fixtures Playwright pour les tests SwissLife One
 * Permet de réutiliser les étapes communes (auth, navigation)
 */
import { test as base } from '@playwright/test';
import { SwissLifeOneInstances } from '../../src/main/flows/registry';
import { SwissLifeOneLeadTransformer } from '../../src/main/flows/platforms/swisslifeone/products/slsis/transformers/LeadTransformer';
import type { SwissLifeOneFormData } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/types';
import type { LeadType } from './types';
import { selectLead, selectLeadByIndex, getLeadTypeName } from '../leads';

type SwissLifeOneFixtures = {
  /** Page authentifiée sur SwissLife One */
  authenticatedPage: void;
  /** Page sur le formulaire SLSIS (iframe chargée) */
  formPage: void;
  /** Données transformées du lead sélectionné */
  leadData: SwissLifeOneFormData;
  /** Formulaire avec Step 1 - Section 1 remplie (Nom du projet) */
  formWithStep1Section1: void;
  /** Formulaire avec Step 1 - Sections 1 et 2 remplies (Nom + Besoins) */
  formWithStep1Section2: void;
  /** Formulaire avec Step 1 - Sections 1, 2 et 3 remplies (Nom + Besoins + Type simulation) */
  formWithStep1Section3: void;
  /** Formulaire avec Step 1 - Sections 1, 2, 3 et 4 remplies (Nom + Besoins + Type simulation + Assuré principal) */
  formWithStep1Section4: void;
  /** Formulaire avec Step 1 - Sections 1, 2, 3, 4 et 5 remplies (+ Conjoint si présent) */
  formWithStep1Section5: void;
  /** Formulaire avec Step 1 - Sections 1-6 remplies (+ Enfants si présents) */
  formWithStep1Section6: void;
  /** Formulaire avec Step 1 COMPLET - Toutes les 7 sections remplies (Gammes et Options) */
  formWithStep1Section7: void;
};

export const test = base.extend<SwissLifeOneFixtures>({
  /**
   * Fixture: données du lead transformées selon le titre du test
   * Détecte le type de lead à partir des emojis dans le nom du test
   * OU utilise LEAD_INDEX si défini dans les variables d'environnement
   */
  leadData: async ({}, use, testInfo) => {
    let lead;
    let selectionMethod: string;

    // Priorité 1 : Sélection par index via variable d'environnement
    const leadIndexEnv = process.env.LEAD_INDEX;
    if (leadIndexEnv !== undefined) {
      const leadIndex = parseInt(leadIndexEnv, 10);
      lead = selectLeadByIndex(leadIndex);
      selectionMethod = `[INDEX ${leadIndex}]`;
      console.log(`\n🎯 ${selectionMethod} Lead selected via LEAD_INDEX`);
    } else {
      // Priorité 2 : Sélection par type basée sur le titre du test
      let leadType: LeadType = 'random';

      const title = testInfo.title;
      if (title.includes('👫') || title.toLowerCase().includes('conjoint')) {
        leadType = 'conjoint';
      } else if (title.includes('👶') || title.toLowerCase().includes('enfants')) {
        leadType = 'children';
      } else if (title.includes('👨‍👩‍👧') || title.toLowerCase().includes('conjoint + enfants')) {
        leadType = 'both';
      }

      lead = selectLead(leadType);
      selectionMethod = getLeadTypeName(leadType);
      console.log(`\n${selectionMethod} [LEAD] Selected by type`);
    }

    const data = SwissLifeOneLeadTransformer.transform(lead);
    await use(data);
  },

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
   * Fixture: formulaire avec Step 1 - Section 1 remplie
   * Dépend de formPage + leadData
   * Remplit uniquement la Section 1 (Nom du projet)
   */
  formWithStep1Section1: async ({ page, formPage, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Step 1 - Section 1...');
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    const formFill = SwissLifeOneInstances.getFormFillStep();
    await formFill.fillStep1Section1(frame, leadData);
    console.log('✅ [FIXTURE] Step 1 - Section 1 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Step 1 - Sections 1 et 2 remplies
   * Dépend de formWithStep1Section1 + leadData
   * Remplit la Section 2 (Vos projets / Besoins)
   */
  formWithStep1Section2: async ({ page, formWithStep1Section1, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Step 1 - Section 2...');
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    const formFill = SwissLifeOneInstances.getFormFillStep();
    await formFill.fillStep1Section2(frame, leadData);
    console.log('✅ [FIXTURE] Step 1 - Section 2 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Step 1 - Sections 1, 2 et 3 remplies
   * Dépend de formWithStep1Section2 + leadData
   * Remplit la Section 3 (Couverture santé individuelle / Type simulation)
   */
  formWithStep1Section3: async ({ page, formWithStep1Section2, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Step 1 - Section 3...');
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    const formFill = SwissLifeOneInstances.getFormFillStep();
    await formFill.fillStep1Section3(frame, leadData);
    console.log('✅ [FIXTURE] Step 1 - Section 3 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Step 1 - Sections 1, 2, 3 et 4 remplies
   * Dépend de formWithStep1Section3 + leadData
   * Remplit la Section 4 (Données de l'assuré principal)
   */
  formWithStep1Section4: async ({ page, formWithStep1Section3, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Step 1 - Section 4...');
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    const formFill = SwissLifeOneInstances.getFormFillStep();
    await formFill.fillStep1Section4(frame, leadData);
    console.log('✅ [FIXTURE] Step 1 - Section 4 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Step 1 - Sections 1, 2, 3, 4 et 5 remplies
   * Dépend de formWithStep1Section4 + leadData
   * Remplit la Section 5 (Données du conjoint) si le lead contient un conjoint
   */
  formWithStep1Section5: async ({ page, formWithStep1Section4, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Step 1 - Section 5...');
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    const formFill = SwissLifeOneInstances.getFormFillStep();
    await formFill.fillStep1Section5(frame, leadData);
    console.log('✅ [FIXTURE] Step 1 - Section 5 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Step 1 - Sections 1-6 remplies
   * Dépend de formWithStep1Section5 + leadData
   * Remplit la Section 6 (Enfants) - sélectionne 0 si pas d'enfants
   */
  formWithStep1Section6: async ({ page, formWithStep1Section5, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Step 1 - Section 6...');
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    const formFill = SwissLifeOneInstances.getFormFillStep();
    await formFill.fillStep1Section6(frame, leadData);
    console.log('✅ [FIXTURE] Step 1 - Section 6 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Step 1 COMPLET - Toutes les 7 sections remplies
   * Dépend de formWithStep1Section6 + leadData
   * Remplit la Section 7 (Gammes et Options) - dernière section du Step 1
   */
  formWithStep1Section7: async ({ page, formWithStep1Section6, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Step 1 - Section 7 (finale)...');
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    const formFill = SwissLifeOneInstances.getFormFillStep();
    await formFill.fillStep1Section7(frame, leadData);
    console.log('✅ [FIXTURE] Step 1 - Section 7 remplie');
    console.log('🎉 [FIXTURE] Step 1 COMPLET - Toutes les sections remplies !');
    await use();
  },
});

export { expect } from '@playwright/test';
