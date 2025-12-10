import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import { SECTION_3_SELECTORS } from './selectors';
import { fillToggleField, fillDateField, fillCategorieSocioprofessionnelleField, fillRegimeObligatoireField } from './operations';

/**
 * Section 3 - Toggle Conjoint
 */
export async function fillToggleConjoint(page: Page, hasConjoint: boolean, logger?: FlowLogger): Promise<void> {
  await fillToggleField(
    page,
    hasConjoint,
    1, // Second toggle (after remplacement_contrat)
    'Conjoint toggle',
    SECTION_3_SELECTORS.toggle_conjoint.primary,
    logger
  );
}

/**
 * Section 3 - Date de naissance du conjoint
 */
export async function fillConjointDateNaissance(page: Page, dateNaissance: string, logger?: FlowLogger): Promise<void> {
  // Date field index: 0 = date_effet, 1 = adherent, 2 = conjoint
  await fillDateField(page, dateNaissance, 2, '[1/3] Conjoint - Date de naissance', logger);
}

/**
 * Section 3 - Catégorie socioprofessionnelle du conjoint
 */
export async function fillConjointCategorieSocioprofessionnelle(page: Page, value: string, logger?: FlowLogger): Promise<void> {
  await fillCategorieSocioprofessionnelleField(
    page,
    value,
    1, // conjoint is second (index 1)
    '[2/3] Conjoint - Catégorie',
    SECTION_3_SELECTORS.categorie_socioprofessionnelle.primary,
    logger
  );
}

// NOTE: Pas de fillConjointCadreExercice pour Santé Pro Plus
// Le conjoint n'a PAS de champ cadre_exercice dans Santé Pro Plus

/**
 * Section 3 - Régime obligatoire du conjoint
 */
export async function fillConjointRegimeObligatoire(page: Page, value: string, logger?: FlowLogger): Promise<void> {
  await fillRegimeObligatoireField(
    page,
    value,
    1, // conjoint is second (index 1)
    '[3/3] Conjoint - Régime',
    SECTION_3_SELECTORS.regime_obligatoire.primary,
    logger
  );
}
