import type { Frame } from '@playwright/test';
import { fillRadioField } from '../operations/RadioOperations';

/**
 * Fill "Besoin couverture individuelle" field (Step 1, Section 2)
 * Uses first occurrence of oui/non buttons (nthIndex: 0)
 */
export async function fillBesoinCouvertureIndividuelle(
  frame: Frame,
  value: boolean
): Promise<void> {
  await fillRadioField(frame, value, {
    fieldLabel: 'Besoin couverture individuelle',
    fieldNumber: 1,
    totalFields: 2,
    nthIndex: 0,
  });
}

/**
 * Fill "Besoin indemnités journalières" field (Step 1, Section 2)
 * Uses second occurrence of oui/non buttons (nthIndex: 1)
 */
export async function fillBesoinIndemnitesJournalieres(
  frame: Frame,
  value: boolean
): Promise<void> {
  await fillRadioField(frame, value, {
    fieldLabel: 'Besoin indemnités journalières',
    fieldNumber: 2,
    totalFields: 2,
    nthIndex: 1,
  });
}

/**
 * Fill complete Section 2: Vos projets
 */
export async function fillSection2(
  frame: Frame,
  besoinCouvertureIndividuelle: boolean,
  besoinIndemnitesJournalieres: boolean
): Promise<void> {
  console.log('\n--- Section 2: Vos projets (Besoins) ---');

  await fillBesoinCouvertureIndividuelle(frame, besoinCouvertureIndividuelle);
  await fillBesoinIndemnitesJournalieres(frame, besoinIndemnitesJournalieres);

  console.log('✅ Section "Vos projets" complétée (2/2 champs)');
  console.log('---\n');
}
