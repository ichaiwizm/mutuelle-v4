/**
 * Fixtures Playwright pour les tests Alptis
 * Permet de réutiliser les étapes communes (auth, navigation, sections)
 *
 * Ce fichier exporte deux ensembles de fixtures:
 * - test: Pour Santé Select (ancien)
 * - santeProPlusTest: Pour Santé Pro Plus (nouveau)
 */
import { test as base } from '@playwright/test';
import { createAlptisServices, createSanteProPlusServices } from '../../src/main/flows/engine/services';
import { getAlptisCredentials } from '../../src/main/flows/config';
import { LeadTransformer } from '../../src/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { LeadTransformer as SanteProPlusLeadTransformer } from '../../src/main/flows/platforms/alptis/products/sante-pro-plus/transformers/LeadTransformer';
import type { FormFillOrchestrator } from '../../src/main/flows/platforms/alptis/products/sante-select/steps/form-fill/FormFillOrchestrator';
import type { FormFillOrchestrator as SanteProPlusFormFillOrchestrator } from '../../src/main/flows/platforms/alptis/products/sante-pro-plus/steps/form-fill/FormFillOrchestrator';
import type { AlptisFormData } from '../../src/main/flows/platforms/alptis/products/sante-select/transformers/types';
import type { SanteProPlusFormData } from '../../src/main/flows/platforms/alptis/products/sante-pro-plus/transformers/types';
import type { LeadType } from './types';
import { selectLead, selectLeadByIndex, getLeadTypeName } from '../leads';

// ============================================================================
// SANTÉ SELECT FIXTURES
// ============================================================================

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
    const services = createAlptisServices(getAlptisCredentials());
    await services.auth.login(page);
    console.log('✅ [FIXTURE] Authentifié');
    await use();
  },

  /**
   * Fixture: page sur le formulaire
   * Dépend de authenticatedPage + effectue la navigation
   */
  formPage: async ({ page, authenticatedPage }, use) => {
    console.log('\n🧭 [FIXTURE] Navigation vers formulaire...');
    const services = createAlptisServices(getAlptisCredentials());
    await services.navigation.execute(page);
    console.log('✅ [FIXTURE] Sur le formulaire');
    await use();
  },

  /**
   * Fixture: formulaire avec Section 1 remplie
   * Dépend de formPage + remplit la Section 1
   */
  formWithSection1: async ({ page, formPage, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Section 1...');
    const services = createAlptisServices(getAlptisCredentials());
    const formFill = services.formFill as FormFillOrchestrator;
    await formFill.fillMiseEnPlace(page, leadData);
    console.log('✅ [FIXTURE] Section 1 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Section 1 et 2 remplies
   * Dépend de formWithSection1 + remplit la Section 2
   */
  formWithSection2: async ({ page, formWithSection1, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Section 2...');
    const services = createAlptisServices(getAlptisCredentials());
    const formFill = services.formFill as FormFillOrchestrator;
    await formFill.fillAdherent(page, leadData);
    console.log('✅ [FIXTURE] Section 2 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Sections 1, 2 et 3 remplies
   * Dépend de formWithSection2 + remplit la Section 3 (si conjoint présent)
   */
  formWithSection3: async ({ page, formWithSection2, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Section 3...');
    const services = createAlptisServices(getAlptisCredentials());
    const formFill = services.formFill as FormFillOrchestrator;

    const hasConjoint = !!leadData.conjoint;

    if (hasConjoint) {
      await formFill.fillConjointToggle(page, true);
      await formFill.fillConjoint(page, leadData.conjoint);
      console.log('✅ [FIXTURE] Section 3 remplie (avec conjoint)');
    } else {
      await formFill.fillConjointToggle(page, false);
      console.log('✅ [FIXTURE] Section 3 remplie (sans conjoint)');
    }

    await use();
  },
});

export { expect } from '@playwright/test';

// ============================================================================
// SANTÉ PRO PLUS FIXTURES
// ============================================================================

type SanteProPlusFixtures = {
  /** Page authentifiée sur Alptis */
  authenticatedPage: void;
  /** Page sur le formulaire Santé Pro Plus */
  formPage: void;
  /** Formulaire avec Section 1 remplie */
  formWithSection1: void;
  /** Formulaire avec Section 1 et 2 remplies */
  formWithSection2: void;
  /** Formulaire avec Sections 1, 2 et 3 remplies */
  formWithSection3: void;
  /** Données transformées du premier lead (Santé Pro Plus) */
  leadData: SanteProPlusFormData;
};

export const santeProPlusTest = base.extend<SanteProPlusFixtures>({
  /**
   * Fixture: données du lead transformées selon le titre du test
   * Utilise SanteProPlusLeadTransformer pour Santé Pro Plus
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

      // Filtrer par éligibilité Santé Pro Plus (âge 18-67 ans)
      lead = selectLead(leadType, 'sante-pro-plus');
      selectionMethod = getLeadTypeName(leadType);
      console.log(`\n${selectionMethod} [LEAD] Selected by type`);
    }

    const data = SanteProPlusLeadTransformer.transform(lead);
    await use(data);
  },

  /**
   * Fixture: page authentifiée
   * Effectue le login Alptis (même authentification que Santé Select)
   */
  authenticatedPage: async ({ page }, use) => {
    console.log('\n🔐 [FIXTURE] Authentification...');
    const services = createSanteProPlusServices(getAlptisCredentials());
    await services.auth.login(page);
    console.log('✅ [FIXTURE] Authentifié');
    await use();
  },

  /**
   * Fixture: page sur le formulaire Santé Pro Plus
   * Dépend de authenticatedPage + effectue la navigation vers /sante-pro-plus/
   */
  formPage: async ({ page, authenticatedPage }, use) => {
    console.log('\n🧭 [FIXTURE] Navigation vers formulaire Santé Pro Plus...');
    const services = createSanteProPlusServices(getAlptisCredentials());
    await services.navigation.execute(page);
    console.log('✅ [FIXTURE] Sur le formulaire Santé Pro Plus');
    await use();
  },

  /**
   * Fixture: formulaire avec Section 1 remplie
   * Dépend de formPage + remplit la Section 1
   */
  formWithSection1: async ({ page, formPage, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Section 1...');
    const services = createSanteProPlusServices(getAlptisCredentials());
    const formFill = services.formFill as SanteProPlusFormFillOrchestrator;
    await formFill.fillMiseEnPlace(page, leadData);
    console.log('✅ [FIXTURE] Section 1 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Section 1 et 2 remplies
   * Dépend de formWithSection1 + remplit la Section 2
   */
  formWithSection2: async ({ page, formWithSection1, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Section 2...');
    const services = createSanteProPlusServices(getAlptisCredentials());
    const formFill = services.formFill as SanteProPlusFormFillOrchestrator;
    await formFill.fillAdherent(page, leadData);
    console.log('✅ [FIXTURE] Section 2 remplie');
    await use();
  },

  /**
   * Fixture: formulaire avec Sections 1, 2 et 3 remplies
   * Dépend de formWithSection2 + remplit la Section 3 (si conjoint présent)
   */
  formWithSection3: async ({ page, formWithSection2, leadData }, use) => {
    console.log('\n📝 [FIXTURE] Remplissage Section 3...');
    const services = createSanteProPlusServices(getAlptisCredentials());
    const formFill = services.formFill as SanteProPlusFormFillOrchestrator;

    const hasConjoint = !!leadData.conjoint;

    if (hasConjoint) {
      await formFill.fillConjointToggle(page, true);
      await formFill.fillConjoint(page, leadData.conjoint);
      console.log('✅ [FIXTURE] Section 3 remplie (avec conjoint)');
    } else {
      await formFill.fillConjointToggle(page, false);
      console.log('✅ [FIXTURE] Section 3 remplie (sans conjoint)');
    }

    await use();
  },
});

