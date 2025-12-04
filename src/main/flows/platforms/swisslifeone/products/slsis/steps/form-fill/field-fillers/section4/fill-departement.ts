import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import { fillSelectField } from '../../operations/SelectOperations';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';

/**
 * Fill "Departement de residence" field for assure principal (Step 1, Section 4)
 */
export async function fillDepartementResidence(
  frame: Frame,
  departement: string,
  logger?: FlowLogger
): Promise<void> {
  await fillSelectField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section4.departement_assure_principal.primary,
    departement,
    {
      fieldLabel: 'Departement de residence',
      fieldNumber: 2,
      totalFields: 4,
    },
    logger
  );
}
