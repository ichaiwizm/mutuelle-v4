import type { Page } from 'playwright';
import type { AlptisFormData } from '../../../transformers/types';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { scrollToSection } from '../helpers/scroll-helpers';
import {
  fillCivilite,
  fillNom,
  fillPrenom,
  fillDateNaissance,
  fillCategorieSocioprofessionnelle,
  fillCadreExercice,
  fillRegimeObligatoire,
  fillCodePostal,
} from '../fill-section2';

/**
 * Section 2: Adhérent(e)
 * Handles 8 fields: civilite, nom, prenom, date_naissance, categorie_socioprofessionnelle,
 * cadre_exercice (conditional), regime_obligatoire, code_postal
 */
export class Section2Fill {
  /**
   * Fill Section 2: Adhérent(e)
   */
  async fill(page: Page, data: AlptisFormData, logger?: FlowLogger): Promise<void> {
    logger?.debug('Starting Section 2: Adhérent(e)');

    await scrollToSection(page, 'Adhérent', logger);

    await fillCivilite(page, data.adherent.civilite, logger);
    await fillNom(page, data.adherent.nom, logger);
    await fillPrenom(page, data.adherent.prenom, logger);
    await fillDateNaissance(page, data.adherent.date_naissance, logger);
    await fillCategorieSocioprofessionnelle(page, data.adherent.categorie_socioprofessionnelle, logger);

    // Cadre d'exercice is conditional - only appears for certain professions
    if (data.adherent.cadre_exercice) {
      await fillCadreExercice(page, data.adherent.cadre_exercice, logger);
    }

    await fillRegimeObligatoire(page, data.adherent.regime_obligatoire, logger);
    await fillCodePostal(page, data.adherent.code_postal, logger);

    const fieldCount = data.adherent.cadre_exercice ? 8 : 7;
    logger?.info('Section "Adhérent(e)" completed', {
      section: 'adherent',
      fieldsCount: fieldCount,
      hasCadreExercice: !!data.adherent.cadre_exercice,
    });
  }
}
