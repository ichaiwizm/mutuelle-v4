/**
 * Fixtures Playwright pour les tests Alptis
 * Permet de réutiliser les étapes communes (auth, navigation, sections)
 */
import { test as base } from '@playwright/test';
import { AlptisAuth } from '@/main/flows/platforms/alptis/lib/AlptisAuth';
import { NavigationStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/navigation';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import type { AlptisFormData } from '@/main/flows/platforms/alptis/products/sante-select/transformers/types';
import type { LeadType } from './helpers/leadSelector';
import { getAlptisCredentials } from './helpers/credentials';
import { loadAllLeads } from './helpers/loadLeads';
import { selectLead, getLeadTypeName } from './helpers/leadSelector';

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
   */
  leadData: async ({}, use, testInfo) => {
    let leadType: LeadType = 'random';

    // Parse le titre du test pour détecter le type de lead
    const title = testInfo.title;
    if (title.includes('👫') || title.toLowerCase().includes('conjoint')) {
      leadType = 'conjoint';
    } else if (title.includes('👶') || title.toLowerCase().includes('enfants')) {
      leadType = 'children';
    } else if (title.includes('👨‍👩‍👧') || title.toLowerCase().includes('conjoint + enfants')) {
      leadType = 'both';
    }

    const lead = selectLead(leadType);
    console.log(`\n${getLeadTypeName(leadType)} [LEAD] Selected`);

    const data = LeadTransformer.transform(lead);
    await use(data);
  },

  /**
   * Fixture: page authentifiée
   * Effectue le login Alptis
   */
  authenticatedPage: async ({ page }, use) => {
    console.log('\n🔐 [FIXTURE] Authentification...');
    const auth = new AlptisAuth(getAlptisCredentials());
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
    const nav = new NavigationStep();
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
    const step = new FormFillStep();
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
    const step = new FormFillStep();
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
    const step = new FormFillStep();

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

