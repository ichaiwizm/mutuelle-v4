/**
 * Form verification helpers for E2E tests
 */
import { expect, type Page } from '@playwright/test';
import type { AlptisFormData } from '@/main/flows/platforms/alptis/products/sante-select/transformers/types';
import {
  verifyToggleState,
  verifyRadioSelection,
  verifyDateValue,
  verifyTextValue,
  verifySelectValue,
} from '@/lib/playwright/form/assertions';

/**
 * Verify Section 1 fields are filled correctly
 */
export async function verifySection1(page: Page, data: AlptisFormData): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification de la section 1...');

  // Check remplacement_contrat
  const remplacementToggle = page.locator("[class*='totem-toggle__input']").first();
  await verifyToggleState(page, remplacementToggle, data.mise_en_place.remplacement_contrat);
  console.log(`✅ [VERIFY] Remplacement contrat: ${data.mise_en_place.remplacement_contrat ? 'Oui' : 'Non'}`);

  // Check demande_resiliation if applicable
  if (data.mise_en_place.remplacement_contrat && data.mise_en_place.demande_resiliation) {
    const radioValue = data.mise_en_place.demande_resiliation;
    const selectedRadio = page.locator(`input[name*='form-radio'][value='${radioValue}']`);
    await verifyRadioSelection(page, selectedRadio, radioValue);
    console.log(`✅ [VERIFY] Demande résiliation: ${radioValue}`);
  }

  // Check date_effet
  const dateEffetInput = page.locator("input[placeholder='Ex : 01/01/2020']").first();
  await verifyDateValue(page, dateEffetInput, data.mise_en_place.date_effet);
  console.log(`✅ [VERIFY] Date d'effet: ${data.mise_en_place.date_effet}`);

  await expect(dateEffetInput).not.toBeFocused();
  console.log('✅ [VERIFY] Date input blur: OK');
}

/**
 * Verify Section 2 fields are filled correctly
 */
export async function verifySection2(page: Page, data: AlptisFormData): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification de la section Adhérent...');

  // Civilite (implicit via label click)
  console.log(`✅ [VERIFY] Civilité: ${data.adherent.civilite} (clicked)`);

  // Nom
  await verifyTextValue(page, page.locator('#nom'), data.adherent.nom);
  console.log(`✅ [VERIFY] Nom: ${data.adherent.nom}`);

  // Prenom
  const prenomInput = page.locator('#prenom');
  await verifyTextValue(page, prenomInput, data.adherent.prenom);
  console.log(`✅ [VERIFY] Prénom: ${data.adherent.prenom}`);

  await expect(prenomInput).not.toBeFocused();
  console.log('✅ [VERIFY] Prénom blur: OK');

  // Date naissance
  const dateNaissanceInput = page.locator("input[placeholder='Ex : 01/01/2020']").nth(1);
  await verifyDateValue(page, dateNaissanceInput, data.adherent.date_naissance);
  console.log(`✅ [VERIFY] Date de naissance: ${data.adherent.date_naissance}`);

  await expect(dateNaissanceInput).not.toBeFocused();
  console.log('✅ [VERIFY] Date naissance blur: OK');

  // Categorie socioprofessionnelle
  await verifySelectValue(page, page.locator('#categories-socio-professionnelles-adherent'), data.adherent.categorie_socioprofessionnelle);
  console.log(`✅ [VERIFY] Catégorie: ${data.adherent.categorie_socioprofessionnelle}`);

  // Cadre d'exercice (conditional)
  if (data.adherent.cadre_exercice) {
    const labelText = data.adherent.cadre_exercice === 'SALARIE' ? 'Salarié' : 'Indépendant Président SASU/SAS';
    const cadreRadio = page.locator(`label:has-text("${labelText}")`).first();
    await expect(cadreRadio).toBeVisible();
    console.log(`✅ [VERIFY] Cadre d'exercice: ${data.adherent.cadre_exercice} (${labelText})`);
  }

  // Regime obligatoire
  await verifySelectValue(page, page.locator('#regime-obligatoire-adherent'), data.adherent.regime_obligatoire);
  console.log(`✅ [VERIFY] Régime: ${data.adherent.regime_obligatoire}`);

  // Code postal
  await verifyTextValue(page, page.locator('input#codePostal'), data.adherent.code_postal);
  console.log(`✅ [VERIFY] Code postal: ${data.adherent.code_postal}`);
}

/**
 * Generic function to verify toggle state
 * @param page - Playwright page object
 * @param toggleIndex - Position of the toggle (0 = first, 1 = second, etc.)
 * @param expectedState - Expected state (true = checked, false = unchecked)
 * @param label - Label for logging
 */
async function verifyToggle(page: Page, toggleIndex: number, expectedState: boolean, label: string): Promise<void> {
  console.log(`\n🔍 [VERIFY] Vérification du toggle ${label}...`);

  const toggle = toggleIndex === 0
    ? page.locator("[class*='totem-toggle__input']").first()
    : page.locator("[class*='totem-toggle__input']").nth(toggleIndex);

  await verifyToggleState(page, toggle, expectedState);
  console.log(`✅ [VERIFY] Toggle ${label}: ${expectedState ? 'Oui' : 'Non'}`);
}

/**
 * Verify Section 3 toggle (conjoint) is set correctly
 */
export async function verifySection3Toggle(page: Page, hasConjoint: boolean): Promise<void> {
  await verifyToggle(page, 1, hasConjoint, 'conjoint');
}

/**
 * Verify Section 3 conjoint fields are filled correctly
 */
export async function verifySection3Conjoint(page: Page, data: AlptisFormData['conjoint']): Promise<void> {
  if (!data) {
    console.log('⏭️ Pas de données conjoint, vérification ignorée');
    return;
  }

  console.log('\n🔍 [VERIFY] Vérification du formulaire Conjoint...');

  // Date de naissance
  const conjointDateInput = page.locator("input[placeholder='Ex : 01/01/2020']").nth(2);
  await verifyDateValue(page, conjointDateInput, data.date_naissance);
  console.log(`✅ [VERIFY] Date de naissance conjoint: ${data.date_naissance}`);
  await expect(conjointDateInput).not.toBeFocused();
  console.log('✅ [VERIFY] Date conjoint blur: OK');

  // Catégorie socioprofessionnelle
  await verifySelectValue(page, page.locator('#categories-socio-professionnelles-conjoint'), data.categorie_socioprofessionnelle);
  console.log(`✅ [VERIFY] Catégorie conjoint: ${data.categorie_socioprofessionnelle}`);

  // Cadre d'exercice (conditional)
  if (data.cadre_exercice) {
    const labelText = data.cadre_exercice === 'SALARIE' ? 'Salarié' : 'Indépendant Président SASU/SAS';
    const cadreRadio = page.locator(`label:has-text("${labelText}")`).nth(1); // nth(1) for conjoint
    await expect(cadreRadio).toBeVisible();
    console.log(`✅ [VERIFY] Cadre d'exercice conjoint: ${data.cadre_exercice} (${labelText})`);
  }

  // Régime obligatoire
  await verifySelectValue(page, page.locator('#regime-obligatoire-conjoint'), data.regime_obligatoire);
  console.log(`✅ [VERIFY] Régime conjoint: ${data.regime_obligatoire}`);
}

/**
 * Verify Section 4 toggle (enfants) is set correctly
 */
export async function verifySection4Toggle(page: Page, hasEnfants: boolean): Promise<void> {
  await verifyToggle(page, 2, hasEnfants, 'enfants');
}

/**
 * Verify Section 4 enfant fields are filled correctly
 */
export async function verifySection4Enfant(page: Page, enfantData: { date_naissance: string; regime_obligatoire: string }, childIndex: number): Promise<void> {
  console.log(`\n🔍 [VERIFY] Vérification du formulaire Enfant ${childIndex + 1}...`);

  // Date de naissance
  // Date fields: nth(0) = date effet, nth(1) = adherent, nth(2) = conjoint, nth(3+) = enfants
  const enfantDateInput = page.locator("input[placeholder='Ex : 01/01/2020']").nth(3 + childIndex);
  await verifyDateValue(page, enfantDateInput, enfantData.date_naissance);
  console.log(`✅ [VERIFY] Date de naissance enfant ${childIndex + 1}: ${enfantData.date_naissance}`);
  await expect(enfantDateInput).not.toBeFocused();
  console.log(`✅ [VERIFY] Date enfant ${childIndex + 1} blur: OK`);

  // Régime obligatoire - uses 0-based indexing for all children
  const regimeSelector = `#regime-obligatoire-enfant-${childIndex}`;
  await verifySelectValue(page, page.locator(regimeSelector), enfantData.regime_obligatoire);
  console.log(`✅ [VERIFY] Régime enfant ${childIndex + 1}: ${enfantData.regime_obligatoire}`);
}
