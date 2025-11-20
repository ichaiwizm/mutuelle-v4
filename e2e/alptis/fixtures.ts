/**
 * Fixtures Playwright pour les tests Alptis
 * Permet de réutiliser les étapes communes (auth, navigation, sections)
 */
import { test as base } from '@playwright/test';
import { AlptisInstances } from '../../src/main/flows/registry';
import { LeadTransformer } from '../../src/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import type { AlptisFormData } from '../../src/main/flows/platforms/alptis/products/sante-select/transformers/types';
import type { LeadType } from './types';
import { loadAllLeads, selectLead, selectLeadByIndex, getLeadTypeName } from '../leads';

type AlptisFixtures = {
  /** Page authentifiée sur Alptis */
  authenticatedPage: void;
  /** Page sur le formulaire Santé Select */
  formPage: void;
  /** Formulaire avec Section 1 remplie */
  formWithSection1: void;
  /** Formulaire avec Section 1 et 2 remplies */
  formWithSection2: void;
  /** Formulaire avec Sections 1, 2 et 3 remplies */
  formWithSection3: void;
  /** Données transformées du premier lead */
  leadData: AlptisFormData;
};

export const test = base.extend<AlptisFixtures>({
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

    const data = LeadTransformer.transform(lead);
    await use(data);
  },

  /**
   * Fixture: page authentifiée
   * Effectue le login Alptis
   */
  authenticatedPage: async ({ page }, use) => {
    console.log('\n🔐 [FIXTURE] Authentification...');
    const auth = AlptisInstances.getAuth();
    await auth.login(page);
    console.log('✅ [FIXTURE] Authentifié');
    await use();
  },

  /**
   * Fixture: page sur le formulaire
   * Dépend de authenticatedPage + effectue la navigation
   */
  formPage: async ({ page, authenticatedPage }, use) => {
    console.log('\n🧭 [FIXTURE] Navigation vers formulaire...');
    const nav = AlptisInstances.getNavigationStep();
    await nav.execute(page);
    console.log('✅ [FIXTURE] Sur le formulaire');
    await use();
  },

  /**
   * Fixture: formulaire avec Section 1 remplie
   * Dépend de formPage + remplit la Section 1
   */
  formWithSection1: async ({ page, formPage, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Section 1...');
    const step = AlptisInstances.getFormFillStep();
    await step.fillMiseEnPlace(page, leadData);
    console.log('✅ [FIXTURE] Section 1 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Section 1 et 2 remplies
   * Dépend de formWithSection1 + remplit la Section 2
   */
  formWithSection2: async ({ page, formWithSection1, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Section 2...');
    const step = AlptisInstances.getFormFillStep();
    await step.fillAdherent(page, leadData);
    console.log('✅ [FIXTURE] Section 2 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Sections 1, 2 et 3 remplies
   * Dépend de formWithSection2 + remplit la Section 3 (si conjoint présent)
   */
  formWithSection3: async ({ page, formWithSection2, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Section 3...');
    const step = AlptisInstances.getFormFillStep();

    const hasConjoint = !!leadData.conjoint;

    if (hasConjoint) {
      await step.fillConjointToggle(page, true);
      await step.fillConjoint(page, leadData.conjoint);
      console.log('✅ [FIXTURE] Section 3 remplie (avec conjoint)');
    } else {
      await step.fillConjointToggle(page, false);
      console.log('✅ [FIXTURE] Section 3 remplie (sans conjoint)');
    }

    await use();
  },
});

export { expect } from '@playwright/test';

