/**
 * Field filling functions for individual form fields
 * Extracted from FormFillStep to keep files under 140 lines
 */
import type { Page } from 'playwright';
import { SECTION_1_SELECTORS, SECTION_2_SELECTORS } from './selectors';
import { verifyToggleState, verifyRadioSelection, verifyTextValue, verifyDateValue } from './verifiers';

/**
 * Blur current focused element by clicking outside
 * Triggers validations and closes any open pickers
 */
async function blurField(page: Page): Promise<void> {
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await page.waitForTimeout(150);
}

/**
 * Fill remplacement_contrat toggle
 */
export async function fillRemplacementContrat(page: Page, shouldCheck: boolean): Promise<void> {
  console.log(`[1/3] Remplacement contrat: ${shouldCheck ? 'Oui' : 'Non'}`);

  const toggleLocator = page.locator(SECTION_1_SELECTORS.remplacement_contrat.primary).first();
  const isCurrentlyChecked = await toggleLocator.isChecked();

  if (isCurrentlyChecked !== shouldCheck) {
    await toggleLocator.click();
    console.log(`  ↳ Toggle cliqué (${isCurrentlyChecked ? 'décoché' : 'coché'})`);
    await page.waitForTimeout(300);
  } else {
    console.log(`  ↳ Déjà dans l'état correct`);
  }

  await verifyToggleState(page, toggleLocator, shouldCheck);
}

/**
 * Fill demande_resiliation radio (conditional)
 */
export async function fillDemandeResiliation(page: Page, value: 'Oui' | 'Non'): Promise<void> {
  console.log(`[2/3] Demande résiliation: ${value}`);
  console.log(`  ↳ Champ conditionnel activé`);

  const radioSelector = SECTION_1_SELECTORS.demande_resiliation.primary;
  await page.waitForSelector(radioSelector, { state: 'visible', timeout: 5000 });
  console.log(`  ↳ Champ visible`);

  const radioLocator = page.locator(SECTION_1_SELECTORS.demande_resiliation.byValue(value));
  await radioLocator.click();
  console.log(`  ↳ Option "${value}" sélectionnée`);

  await verifyRadioSelection(page, radioLocator, value);
}

/**
 * Fill date_effet input
 */
export async function fillDateEffet(page: Page, dateEffet: string): Promise<void> {
  console.log(`[3/3] Date d'effet: ${dateEffet}`);

  const dateInputLocator = page.locator(SECTION_1_SELECTORS.date_effet.primary).first();

  await dateInputLocator.clear();
  await dateInputLocator.fill(dateEffet);
  console.log(`  ↳ Date saisie`);

  await verifyDateValue(page, dateInputLocator, dateEffet);

  await blurField(page);
}

/**
 * Fill civilite radio
 */
export async function fillCivilite(page: Page, civilite: 'monsieur' | 'madame'): Promise<void> {
  console.log(`[1/4] Civilité: ${civilite}`);

  const labelText = civilite === 'monsieur' ? 'Monsieur' : 'Madame';
  const labelLocator = page.locator(`label:has-text("${labelText}")`).first();

  await labelLocator.waitFor({ state: 'visible', timeout: 5000 });
  await labelLocator.click();
  console.log(`  ↳ Radio "${civilite}" cliqué (via label)`);
  console.log(`  ✓ Vérifié: civilité sélectionnée (via label click)`);
}

/**
 * Fill nom text input
 */
export async function fillNom(page: Page, nom: string): Promise<void> {
  console.log(`[2/4] Nom: ${nom}`);

  const nomLocator = page.locator(SECTION_2_SELECTORS.nom.primary);
  await nomLocator.clear();
  await nomLocator.fill(nom);
  console.log(`  ↳ Nom saisi`);

  await verifyTextValue(page, nomLocator, nom);
}

/**
 * Fill prenom text input
 */
export async function fillPrenom(page: Page, prenom: string): Promise<void> {
  console.log(`[3/4] Prénom: ${prenom}`);

  const prenomLocator = page.locator(SECTION_2_SELECTORS.prenom.primary);
  await prenomLocator.clear();
  await prenomLocator.fill(prenom);
  console.log(`  ↳ Prénom saisi`);

  await verifyTextValue(page, prenomLocator, prenom);

  await blurField(page);
  console.log(`  ↳ Blur déclenché`);
}

/**
 * Fill date_naissance input (SECOND date field on page)
 */
export async function fillDateNaissance(page: Page, dateNaissance: string): Promise<void> {
  console.log(`[4/4] Date de naissance: ${dateNaissance}`);

  // CRITICAL: Use .nth(1) because date_effet is .nth(0)
  const dateInputLocator = page.locator(SECTION_2_SELECTORS.date_naissance.primary).nth(1);

  await dateInputLocator.clear();
  await dateInputLocator.fill(dateNaissance);
  console.log(`  ↳ Date saisie`);

  await verifyDateValue(page, dateInputLocator, dateNaissance);

  await blurField(page);
  console.log(`  ↳ Blur déclenché`);
}
