import type { Page } from 'playwright';
import { SECTION_2_SELECTORS } from './selectors';
import { verifyTextValue, verifyDateValue, verifySelectValue } from './verifiers';
import { blurField, clearAndType, selectByValue } from './actions';

/**
 * Section 2 - Civilité
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
 * Section 2 - Nom
 */
export async function fillNom(page: Page, nom: string): Promise<void> {
  console.log(`[2/4] Nom: ${nom}`);

  const nomLocator = page.locator(SECTION_2_SELECTORS.nom.primary);
  await clearAndType(nomLocator, nom);
  console.log(`  ↳ Nom saisi`);

  await verifyTextValue(page, nomLocator, nom);
}

/**
 * Section 2 - Prénom
 */
export async function fillPrenom(page: Page, prenom: string): Promise<void> {
  console.log(`[3/4] Prénom: ${prenom}`);

  const prenomLocator = page.locator(SECTION_2_SELECTORS.prenom.primary);
  await clearAndType(prenomLocator, prenom);
  console.log(`  ↳ Prénom saisi`);

  await verifyTextValue(page, prenomLocator, prenom);

  await blurField(page);
  console.log(`  ↳ Blur déclenché`);
}

/**
 * Section 2 - Date de naissance (deuxième champ date de la page)
 */
export async function fillDateNaissance(page: Page, dateNaissance: string): Promise<void> {
  console.log(`[4/4] Date de naissance: ${dateNaissance}`);

  // IMPORTANT: utiliser .nth(1) car date_effet est .nth(0)
  const dateInputLocator = page.locator(SECTION_2_SELECTORS.date_naissance.primary).nth(1);
  await clearAndType(dateInputLocator, dateNaissance);
  console.log(`  ↳ Date saisie`);

  await verifyDateValue(page, dateInputLocator, dateNaissance);

  await blurField(page);
  console.log(`  ↳ Blur déclenché`);
}

/**
 * Section 2 - Catégorie socioprofessionnelle
 */
export async function fillCategorieSocioprofessionnelle(page: Page, value: string): Promise<void> {
  console.log(`[5/7] Catégorie socioprofessionnelle: ${value}`);

  const selectLocator = page.locator(SECTION_2_SELECTORS.categorie_socioprofessionnelle.primary);
  await selectByValue(selectLocator, value);
  console.log(`  ↳ Option "${value}" sélectionnée`);

  await verifySelectValue(page, selectLocator, value);
}

/**
 * Section 2 - Régime obligatoire
 */
export async function fillRegimeObligatoire(page: Page, value: string): Promise<void> {
  console.log(`[6/7] Régime obligatoire: ${value}`);

  const selectLocator = page.locator(SECTION_2_SELECTORS.regime_obligatoire.primary);
  await selectByValue(selectLocator, value);
  console.log(`  ↳ Option "${value}" sélectionnée`);

  await verifySelectValue(page, selectLocator, value);
}

/**
 * Section 2 - Code postal
 */
export async function fillCodePostal(page: Page, codePostal: string): Promise<void> {
  console.log(`[7/7] Code postal: ${codePostal}`);

  const codePostalLocator = page.locator(SECTION_2_SELECTORS.code_postal.primary);
  await clearAndType(codePostalLocator, codePostal);
  console.log(`  ↳ Code postal saisi`);

  await verifyTextValue(page, codePostalLocator, codePostal);
}


