import type { Page } from 'playwright';
import type { AlptisFormData } from '../../../transformers/types';
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
  async fill(page: Page, data: AlptisFormData): Promise<void> {
    console.log('--- SECTION: Adhérent(e) ---');

    await scrollToSection(page, 'Adhérent');

    await fillCivilite(page, data.adherent.civilite);
    await fillNom(page, data.adherent.nom);
    await fillPrenom(page, data.adherent.prenom);
    await fillDateNaissance(page, data.adherent.date_naissance);
    await fillCategorieSocioprofessionnelle(page, data.adherent.categorie_socioprofessionnelle);

    // Cadre d'exercice is conditional - only appears for certain professions
    if (data.adherent.cadre_exercice) {
      await fillCadreExercice(page, data.adherent.cadre_exercice);
    }

    await fillRegimeObligatoire(page, data.adherent.regime_obligatoire);
    await fillCodePostal(page, data.adherent.code_postal);

    const fieldCount = data.adherent.cadre_exercice ? '8/8' : '7/7';
    console.log(`✅ Section "Adhérent(e)" complétée (${fieldCount} champs)`);
    console.log('---');
  }
}
