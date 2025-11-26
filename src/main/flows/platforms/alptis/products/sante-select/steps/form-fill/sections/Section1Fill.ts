import type { Page } from 'playwright';
import type { AlptisFormData } from '../../../transformers/types';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import {
  fillRemplacementContrat,
  fillDemandeResiliation,
  fillDateEffet,
} from '../fill-section1';

/**
 * Section 1: Mise en place du contrat
 * Handles 3 fields: remplacement_contrat, demande_resiliation (conditional), date_effet
 */
export class Section1Fill {
  /**
   * Fill Section 1: Mise en place du contrat
   */
  async fill(page: Page, data: AlptisFormData, logger?: FlowLogger): Promise<void> {
    logger?.debug('Starting Section 1: Mise en place du contrat');

    await fillRemplacementContrat(page, data.mise_en_place.remplacement_contrat, logger);

    if (data.mise_en_place.remplacement_contrat && data.mise_en_place.demande_resiliation) {
      await fillDemandeResiliation(page, data.mise_en_place.demande_resiliation, logger);
    }

    await fillDateEffet(page, data.mise_en_place.date_effet, logger);

    logger?.info('Section "Mise en place du contrat" completed', {
      section: 'mise_en_place',
      fieldsCount: 3,
    });
  }
}
