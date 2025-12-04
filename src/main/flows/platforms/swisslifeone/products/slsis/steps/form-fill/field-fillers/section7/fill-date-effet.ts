import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';
import { fillDateField } from '../../operations/DatepickerOperations';

/**
 * Fill "Date d'effet" field (Step 1, Section 7)
 * Note: Has datepicker, minimum 5 days in the future (enforced by transformer)
 */
export async function fillDateEffet(
  frame: Frame,
  dateEffet: string,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Filling date effet', { dateEffet, field: '2/5' });

  await fillDateField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section7.date_effet.primary,
    dateEffet,
    {
      fieldLabel: 'Date d\'effet',
      fieldNumber: 2,
      totalFields: 5,
    },
    logger
  );

  logger?.debug('Date effet filled', { dateEffet });
}
