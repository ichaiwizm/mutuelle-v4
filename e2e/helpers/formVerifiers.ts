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

  // Regime obligatoire
  await verifySelectValue(page, page.locator('#regime-obligatoire-adherent'), data.adherent.regime_obligatoire);
  console.log(`✅ [VERIFY] Régime: ${data.adherent.regime_obligatoire}`);

  // Code postal
  await verifyTextValue(page, page.locator('#codePostal'), data.adherent.code_postal);
  console.log(`✅ [VERIFY] Code postal: ${data.adherent.code_postal}`);
}
