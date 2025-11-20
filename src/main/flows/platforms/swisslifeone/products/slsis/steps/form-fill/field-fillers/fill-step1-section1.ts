import type { Frame } from '@playwright/test';
import { fillTextboxField } from '../operations/TextboxOperations';
import { SWISSLIFE_STEP1_SELECTORS } from '../selectors';

/**
 * Fill "Nom du projet" field (Step 1, Section 1)
 * This is the first field in the SwissLife One form
 */
export async function fillNomProjet(frame: Frame, nomProjet: string): Promise<void> {
  console.log('\n--- Section 1: Nom du projet ---');

  await fillTextboxField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section1.nom_projet.primary,
    nomProjet,
    {
      fieldLabel: 'Nom du projet',
      fieldNumber: 1,
      totalFields: 1,
    }
  );

  console.log('✅ Section "Nom du projet" complétée (1/1 champs)');
  console.log('---\n');
}
