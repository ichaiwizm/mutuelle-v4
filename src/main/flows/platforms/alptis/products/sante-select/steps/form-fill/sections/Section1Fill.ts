import type { Page } from 'playwright';
import type { AlptisFormData } from '../../../transformers/types';
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
  async fill(page: Page, data: AlptisFormData): Promise<void> {
    console.log('--- SECTION: Mise en place du contrat ---');

    await fillRemplacementContrat(page, data.mise_en_place.remplacement_contrat);

    if (data.mise_en_place.remplacement_contrat && data.mise_en_place.demande_resiliation) {
      await fillDemandeResiliation(page, data.mise_en_place.demande_resiliation);
    }

    await fillDateEffet(page, data.mise_en_place.date_effet);

    console.log('✅ Section "Mise en place du contrat" complétée');
    console.log('---');
  }
}
