import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../engine/FlowLogger';
import { SECTION_3_SELECTORS } from './selectors/section3';
import {
  fillToggleField,
  fillDateField,
  fillCadreExerciceField,
  fillCategorieSocioprofessionnelleField,
  fillRegimeObligatoireField,
} from './operations';

/**
 * Section 3 - Toggle Conjoint
 */
export async function fillToggleConjoint(page: Page, shouldCheck: boolean, logger?: FlowLogger): Promise<void> {
  await fillToggleField(page, shouldCheck, 1, '[1/1] Toggle conjoint', SECTION_3_SELECTORS.toggle_conjoint.primary, logger);
}

/**
 * Section 3 - Date de naissance du conjoint
 */
export async function fillConjointDateNaissance(page: Page, dateNaissance: string, logger?: FlowLogger): Promise<void> {
  await fillDateField(page, dateNaissance, 2, '[1/4] Date de naissance conjoint', logger);
}

/**
 * Section 3 - Catégorie socioprofessionnelle du conjoint
 */
export async function fillConjointCategorieSocioprofessionnelle(page: Page, value: string, logger?: FlowLogger): Promise<void> {
  await fillCategorieSocioprofessionnelleField(
    page,
    value,
    1, // conjoint is second (index 1)
    '[2/4] Catégorie conjoint',
    SECTION_3_SELECTORS.categorie_socioprofessionnelle.primary,
    logger
  );
}

/**
 * Section 3 - Cadre d'exercice du conjoint (conditionnel)
 */
export async function fillConjointCadreExercice(page: Page, value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS', logger?: FlowLogger): Promise<void> {
  await fillCadreExerciceField(
    page,
    value,
    1, // conjoint is second (index 1)
    "[3/4] Cadre d'exercice conjoint",
    logger
  );
}

/**
 * Section 3 - Régime obligatoire du conjoint
 */
export async function fillConjointRegimeObligatoire(page: Page, value: string, logger?: FlowLogger): Promise<void> {
  await fillRegimeObligatoireField(
    page,
    value,
    1, // conjoint is second (index 1)
    '[4/4] Régime conjoint',
    SECTION_3_SELECTORS.regime_obligatoire.primary,
    logger
  );
}
