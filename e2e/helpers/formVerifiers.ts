/**
 * Form verification helpers for E2E tests
 */
import { expect, type Page } from '@playwright/test';
import type { AlptisFormData } from '../../src/main/flows/platforms/alptis/products/sante-select/transformers/types';

/**
 * Verify Section 1 fields are filled correctly
 */
export async function verifySection1(page: Page, data: AlptisFormData): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification de la section 1...');

  // Check remplacement_contrat
  const remplacementToggle = page.locator("[class*='totem-toggle__input']").first();
  const isRemplacementChecked = await remplacementToggle.isChecked();
  expect(isRemplacementChecked).toBe(data.mise_en_place.remplacement_contrat);
  console.log(`✅ [VERIFY] Remplacement contrat: ${isRemplacementChecked ? 'Oui' : 'Non'}`);

  // Check demande_resiliation if applicable
  if (data.mise_en_place.remplacement_contrat && data.mise_en_place.demande_resiliation) {
    const radioValue = data.mise_en_place.demande_resiliation;
    const selectedRadio = page.locator(`input[name*='form-radio'][value='${radioValue}']`);
    const isRadioChecked = await selectedRadio.isChecked();
    expect(isRadioChecked).toBe(true);
    console.log(`✅ [VERIFY] Demande résiliation: ${radioValue}`);
  }

  // Check date_effet
  const dateEffetInput = page.locator("input[placeholder='Ex : 01/01/2020']").first();
  const dateEffetValue = await dateEffetInput.inputValue();
  expect(dateEffetValue).toBe(data.mise_en_place.date_effet);
  console.log(`✅ [VERIFY] Date d'effet: ${dateEffetValue}`);

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
  const nomValue = await page.inputValue('#nom');
  expect(nomValue).toBe(data.adherent.nom);
  console.log(`✅ [VERIFY] Nom: ${nomValue}`);

  // Prenom
  const prenomValue = await page.inputValue('#prenom');
  expect(prenomValue).toBe(data.adherent.prenom);
  console.log(`✅ [VERIFY] Prénom: ${prenomValue}`);

  // Date naissance
  const dateNaissanceInput = page.locator("input[placeholder='Ex : 01/01/2020']").nth(1);
  const dateNaissanceValue = await dateNaissanceInput.inputValue();
  expect(dateNaissanceValue).toBe(data.adherent.date_naissance);
  console.log(`✅ [VERIFY] Date de naissance: ${dateNaissanceValue}`);

  await expect(dateNaissanceInput).not.toBeFocused();
  console.log('✅ [VERIFY] Date naissance blur: OK');
}
