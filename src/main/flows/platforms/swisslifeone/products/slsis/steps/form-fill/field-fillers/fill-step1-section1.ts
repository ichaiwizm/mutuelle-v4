import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { fillTextboxField } from '../operations/TextboxOperations';
import { SWISSLIFE_STEP1_SELECTORS } from '../selectors';

/**
 * Fill "Nom du projet" field (Step 1, Section 1)
 * This is the first field in the SwissLife One form
 */
export async function fillNomProjet(frame: Frame, nomProjet: string, logger?: FlowLogger): Promise<void> {
  logger?.debug('Starting Section 1: Nom du projet');

  await fillTextboxField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section1.nom_projet.primary,
    nomProjet,
    {
      fieldLabel: 'Nom du projet',
      fieldNumber: 1,
      totalFields: 1,
    },
    logger
  );

  logger?.info('Section "Nom du projet" completed', { section: 'nom_projet', fieldsCount: 1 });
}
