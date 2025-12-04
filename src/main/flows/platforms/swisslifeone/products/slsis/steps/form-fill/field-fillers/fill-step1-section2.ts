import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { fillRadioField } from '../operations/RadioOperations';

/**
 * Fill "Besoin couverture individuelle" field (Step 1, Section 2)
 * Uses first occurrence of oui/non buttons (nthIndex: 0)
 */
export async function fillBesoinCouvertureIndividuelle(
  frame: Frame,
  value: boolean,
  logger?: FlowLogger
): Promise<void> {
  await fillRadioField(frame, value, {
    fieldLabel: 'Besoin couverture individuelle',
    fieldNumber: 1,
    totalFields: 2,
    nthIndex: 0,
  }, logger);
}

/**
 * Fill "Besoin indemnités journalières" field (Step 1, Section 2)
 * Uses second occurrence of oui/non buttons (nthIndex: 1)
 */
export async function fillBesoinIndemnitesJournalieres(
  frame: Frame,
  value: boolean,
  logger?: FlowLogger
): Promise<void> {
  await fillRadioField(frame, value, {
    fieldLabel: 'Besoin indemnités journalières',
    fieldNumber: 2,
    totalFields: 2,
    nthIndex: 1,
  }, logger);
}

/**
 * Fill complete Section 2: Vos projets
 */
export async function fillSection2(
  frame: Frame,
  besoinCouvertureIndividuelle: boolean,
  besoinIndemnitesJournalieres: boolean,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Starting Section 2: Vos projets (Besoins)');

  await fillBesoinCouvertureIndividuelle(frame, besoinCouvertureIndividuelle, logger);
  await fillBesoinIndemnitesJournalieres(frame, besoinIndemnitesJournalieres, logger);

  logger?.info('Section "Vos projets" completed', { section: 'vos_projets', fieldsCount: 2 });
}
