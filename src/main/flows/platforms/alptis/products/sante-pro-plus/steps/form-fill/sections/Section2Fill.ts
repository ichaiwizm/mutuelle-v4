import type { Page } from 'playwright';
import type { SanteProPlusFormData } from '../../../transformers/types';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { scrollToSection } from '../helpers/scroll-helpers';
import {
  fillCivilite,
  fillNom,
  fillPrenom,
  fillDateNaissance,
  fillCategorieSocioprofessionnelle,
  fillMicroEntrepreneur,
  fillCadreExercice,
  fillStatutProfessionnel,
  fillRegimeObligatoire,
  fillCodePostal,
  fillVille,
} from '../fill-section2';

/**
 * Section 2: Adhérent(e)
 * Handles up to 11 fields:
 * - civilite, nom, prenom, date_naissance
 * - categorie_socioprofessionnelle
 * - micro_entrepreneur (NOUVEAU)
 * - cadre_exercice (conditionnel - 5 professions)
 * - statut_professionnel (NOUVEAU - seulement pour Chefs d'entreprise)
 * - regime_obligatoire
 * - code_postal
 * - ville (NOUVEAU - auto-rempli via code postal)
 */
export class Section2Fill {
  /**
   * Fill Section 2: Adhérent(e)
   */
  async fill(page: Page, data: SanteProPlusFormData, logger?: FlowLogger): Promise<void> {
    logger?.debug('Starting Section 2: Adhérent(e)');

    await scrollToSection(page, 'Adhérent', logger);

    // Champs de base
    await fillCivilite(page, data.adherent.civilite, logger);
    await fillNom(page, data.adherent.nom, logger);
    await fillPrenom(page, data.adherent.prenom, logger);
    await fillDateNaissance(page, data.adherent.date_naissance, logger);
    await fillCategorieSocioprofessionnelle(page, data.adherent.categorie_socioprofessionnelle, logger);

    // NOUVEAU: Micro-entrepreneur (toujours 'Non')
    await fillMicroEntrepreneur(page, data.adherent.micro_entrepreneur, logger);

    // Cadre d'exercice (conditionnel - 5 professions)
    if (data.adherent.cadre_exercice) {
      await fillCadreExercice(page, data.adherent.cadre_exercice, logger);
    }

    // NOUVEAU: Statut professionnel (seulement pour Chefs d'entreprise)
    if (data.adherent.statut_professionnel) {
      await fillStatutProfessionnel(page, data.adherent.statut_professionnel, logger);
    }

    await fillRegimeObligatoire(page, data.adherent.regime_obligatoire, logger);
    await fillCodePostal(page, data.adherent.code_postal, logger);

    // NOUVEAU: Ville (auto-remplie via code postal)
    await fillVille(page, logger);

    // Compter les champs remplis
    let fieldCount = 9; // Champs de base + micro_entrepreneur + ville
    if (data.adherent.cadre_exercice) fieldCount++;
    if (data.adherent.statut_professionnel) fieldCount++;

    logger?.info('Section "Adhérent(e)" completed', {
      section: 'adherent',
      fieldsCount: fieldCount,
      hasCadreExercice: !!data.adherent.cadre_exercice,
      hasStatutProfessionnel: !!data.adherent.statut_professionnel,
    });
  }
}
