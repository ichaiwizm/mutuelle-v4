import type { Frame } from '@playwright/test';
import { fillTextboxField } from '../operations/TextboxOperations';
import { SWISSLIFE_STEP1_SELECTORS } from '../selectors';
import { SwissLifeOneTimeouts } from '../../../../../../../config';
import { mapAyantDroitToFormLabel } from '../mappers/ayant-droit-form-mapper';
import type { EnfantsData, EnfantData } from '../../../transformers/types';

/**
 * Fill "Nombre d'enfants" field (Step 1, Section 6)
 * Selecting a value > 0 triggers dynamic table row creation
 */
export async function fillNombreEnfants(
  frame: Frame,
  nombreEnfants: number
): Promise<void> {
  console.log(`[1/${nombreEnfants > 0 ? 1 + nombreEnfants * 2 : 1}] Nombre d'enfants: ${nombreEnfants}`);

  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section6.nombre_enfants.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });
  await selectElement.selectOption({ label: nombreEnfants.toString() });
  await frame.waitForTimeout(2000); // Wait for dynamic table to appear

  console.log(`✅ Nombre d'enfants sélectionné: ${nombreEnfants}`);

  if (nombreEnfants > 0) {
    // Wait for the dynamic table to appear
    console.log('⏳ Attente du chargement du tableau enfants...');
    const firstChildDateInput = frame.locator(SWISSLIFE_STEP1_SELECTORS.section6.enfant_date_naissance(0)).first();
    await firstChildDateInput.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Tableau enfants chargé');
  }
}

/**
 * Fill one child's data in the dynamic table (Step 1, Section 6)
 * @param frame - Playwright frame
 * @param enfantData - Child data (date_naissance, ayant_droit)
 * @param index - Child index (0-based)
 * @param total - Total number of children
 */
export async function fillEnfantRow(
  frame: Frame,
  enfantData: EnfantData,
  index: number,
  total: number
): Promise<void> {
  const fieldNumber = 2 + index * 2; // Starts at 2 (after nombre_enfants)
  const totalFields = 1 + total * 2;

  console.log(`\n--- Enfant ${index + 1}/${total} ---`);

  // Fill date de naissance
  console.log(`[${fieldNumber}/${totalFields}] Date de naissance enfant ${index + 1}: ${enfantData.date_naissance}`);
  const dateSelector = SWISSLIFE_STEP1_SELECTORS.section6.enfant_date_naissance(index);

  await fillTextboxField(
    frame,
    dateSelector,
    enfantData.date_naissance,
    {
      fieldLabel: `Date de naissance enfant ${index + 1}`,
      fieldNumber,
      totalFields,
    }
  );

  // Close the datepicker if it's open
  const datepicker = frame.locator('#ui-datepicker-div');
  const isVisible = await datepicker.isVisible().catch(() => false);

  if (isVisible) {
    await frame.locator('body').click({ position: { x: 10, y: 10 } });
    await datepicker.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      console.log('⚠️  Datepicker still visible after click');
    });
    await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);
  }

  // Fill ayant droit
  console.log(`[${fieldNumber + 1}/${totalFields}] Ayant droit enfant ${index + 1}: ${enfantData.ayant_droit}`);
  const ayantDroitLabel = mapAyantDroitToFormLabel(enfantData.ayant_droit);
  const ayantDroitSelector = SWISSLIFE_STEP1_SELECTORS.section6.enfant_ayant_droit(index);

  const ayantDroitElement = frame.locator(ayantDroitSelector).first();
  await ayantDroitElement.waitFor({ state: 'visible', timeout: 10000 });
  await ayantDroitElement.selectOption({ label: ayantDroitLabel });
  await frame.waitForTimeout(2000);

  console.log(`✅ Enfant ${index + 1} rempli avec succès`);
}

/**
 * Fill complete Section 6: Enfants
 * Fills: nombre_enfants + for each child: date_naissance, ayant_droit
 */
export async function fillSection6(
  frame: Frame,
  enfantsData: EnfantsData | undefined
): Promise<void> {
  console.log('\n--- Section 6: Enfants ---');

  // If no children data, select 0 and return
  if (!enfantsData || enfantsData.nombre_enfants === 0) {
    console.log('ℹ️  Aucun enfant à assurer');
    await fillNombreEnfants(frame, 0);
    console.log('✅ Section "Enfants" complétée (0 enfants)');
    console.log('---\n');
    return;
  }

  // Select number of children
  await fillNombreEnfants(frame, enfantsData.nombre_enfants);

  // Fill each child's data
  for (let i = 0; i < enfantsData.liste.length; i++) {
    await fillEnfantRow(frame, enfantsData.liste[i], i, enfantsData.liste.length);
  }

  console.log(`✅ Section "Enfants" complétée (${enfantsData.nombre_enfants} enfant${enfantsData.nombre_enfants > 1 ? 's' : ''})`);
  console.log('---\n');
}
