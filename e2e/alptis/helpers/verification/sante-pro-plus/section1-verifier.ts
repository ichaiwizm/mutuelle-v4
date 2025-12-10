/**
 * Section 1 (Mise en place) form verification helpers for Santé Pro Plus
 * Identique à Santé Select
 */
import { expect, type Page } from '@playwright/test';
import type { SanteProPlusFormData } from '@/main/flows/platforms/alptis/products/sante-pro-plus/transformers/types';
import {
  verifyToggleState,
  verifyRadioSelection,
  verifyDateValue,
} from '@/lib/playwright/form/assertions';

/**
 * Verify Section 1 fields are filled correctly
 */
export async function verifySection1(page: Page, data: SanteProPlusFormData): Promise<void> {
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
