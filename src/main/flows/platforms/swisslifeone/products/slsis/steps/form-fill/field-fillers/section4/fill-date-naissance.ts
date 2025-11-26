import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';
import { fillDateField } from '../../operations/DatepickerOperations';

/**
 * Fill "Date de naissance" field for assure principal (Step 1, Section 4)
 * Note: This field opens a jQuery UI datepicker that needs to be closed by clicking elsewhere
 */
export async function fillDateNaissanceAssurePrincipal(
  frame: Frame,
  dateNaissance: string,
  logger?: FlowLogger
): Promise<void> {
  await fillDateField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section4.date_naissance_assure_principal.primary,
    dateNaissance,
    {
      fieldLabel: 'Date de naissance assure principal',
      fieldNumber: 1,
      totalFields: 1,
    },
    logger
  );
}
