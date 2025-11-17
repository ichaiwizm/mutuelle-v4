import type { Page } from 'playwright';
import { SECTION_3_SELECTORS } from './selectors/section3';
import { verifyToggleState } from './verifiers';
import {
  fillDateField,
  fillCadreExerciceField,
  fillCategorieSocioprofessionnelleField,
  fillRegimeObligatoireField,
} from './field-fillers';

/**
 * Section 3 - Toggle Conjoint
 */
export async function fillToggleConjoint(page: Page, shouldCheck: boolean): Promise<void> {
  console.log(`[1/1] Toggle conjoint: ${shouldCheck ? 'Oui' : 'Non'}`);

  // Usually the conjoint toggle is the second toggle on the page (first is remplacement_contrat)
  const toggleLocator = page.locator(SECTION_3_SELECTORS.toggle_conjoint.primary).nth(1);

  const isCurrentlyChecked = await toggleLocator.isChecked();

  if (isCurrentlyChecked !== shouldCheck) {
    // Use force: true because the label overlays the input element
    await toggleLocator.click({ force: true });
    console.log(`  ↳ Toggle cliqué (${isCurrentlyChecked ? 'décoché' : 'coché'})`);
    await page.waitForTimeout(300);
  } else {
    console.log(`  ↳ Déjà dans l'état correct`);
  }

  await verifyToggleState(page, toggleLocator, shouldCheck);
}

/**
 * Section 3 - Date de naissance du conjoint
 */
export async function fillConjointDateNaissance(page: Page, dateNaissance: string): Promise<void> {
  await fillDateField(page, dateNaissance, 2, '[1/4] Date de naissance conjoint');
}

/**
 * Section 3 - Catégorie socioprofessionnelle du conjoint
 */
export async function fillConjointCategorieSocioprofessionnelle(page: Page, value: string): Promise<void> {
  await fillCategorieSocioprofessionnelleField(
    page,
    value,
    1, // conjoint is second (index 1)
    '[2/4] Catégorie conjoint',
    SECTION_3_SELECTORS.categorie_socioprofessionnelle.primary
  );
}

/**
 * Section 3 - Cadre d'exercice du conjoint (conditionnel)
 */
export async function fillConjointCadreExercice(page: Page, value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS'): Promise<void> {
  await fillCadreExerciceField(
    page,
    value,
    1, // conjoint is second (index 1)
    "[3/4] Cadre d'exercice conjoint"
  );
}

/**
 * Section 3 - Régime obligatoire du conjoint
 */
export async function fillConjointRegimeObligatoire(page: Page, value: string): Promise<void> {
  await fillRegimeObligatoireField(
    page,
    value,
    1, // conjoint is second (index 1)
    '[4/4] Régime conjoint',
    SECTION_3_SELECTORS.regime_obligatoire.primary
  );
}
