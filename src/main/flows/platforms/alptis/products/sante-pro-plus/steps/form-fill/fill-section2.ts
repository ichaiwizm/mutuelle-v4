import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import type { AlptisCadreExercice, AlptisStatutProfessionnel } from '../../transformers/types';
import { SECTION_2_SELECTORS } from './selectors';
import { verifyTextValue } from './verifiers';
import { blurField, clearAndType } from './actions';
import {
  fillDateField,
  fillCadreExerciceField,
  fillStatutProfessionnelField,
  fillMicroEntrepreneurField,
  fillCategorieSocioprofessionnelleField,
  fillRegimeObligatoireField,
  fillVilleField,
} from './operations';

// Champs Section 2 - Adhérent(e)

export async function fillCivilite(page: Page, civilite: 'monsieur' | 'madame', logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling civilité', { civilite, field: '1/11' });
  const label = page.locator(`label:has-text("${civilite === 'monsieur' ? 'Monsieur' : 'Madame'}")`).first();
  await label.waitFor({ state: 'visible', timeout: 5000 });
  await label.click();
}

export async function fillNom(page: Page, nom: string, logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling nom', { nom, field: '2/11' });
  await clearAndType(page.locator(SECTION_2_SELECTORS.nom.primary), nom);
  await verifyTextValue(page, page.locator(SECTION_2_SELECTORS.nom.primary), nom);
}

export async function fillPrenom(page: Page, prenom: string, logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling prénom', { prenom, field: '3/11' });
  await clearAndType(page.locator(SECTION_2_SELECTORS.prenom.primary), prenom);
  await verifyTextValue(page, page.locator(SECTION_2_SELECTORS.prenom.primary), prenom);
  await blurField(page);
}

export async function fillDateNaissance(page: Page, dateNaissance: string, logger?: FlowLogger): Promise<void> {
  await fillDateField(page, dateNaissance, 1, '[4/11] Date de naissance', logger);
}

export async function fillCategorieSocioprofessionnelle(page: Page, value: string, logger?: FlowLogger): Promise<void> {
  await fillCategorieSocioprofessionnelleField(
    page,
    value,
    0, // adherent is first (index 0)
    '[5/11] Catégorie',
    SECTION_2_SELECTORS.categorie_socioprofessionnelle.primary,
    logger
  );
}

/**
 * NOUVEAU pour Santé Pro Plus - Micro-entrepreneur (toujours visible)
 */
export async function fillMicroEntrepreneur(page: Page, value: 'Oui' | 'Non', logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling micro-entrepreneur', { value, field: '6/11' });
  await fillMicroEntrepreneurField(page, value, logger);
}

/**
 * Cadre d'exercice (conditionnel - même 5 professions que Santé Select)
 */
export async function fillCadreExercice(page: Page, value: AlptisCadreExercice, logger?: FlowLogger): Promise<void> {
  await fillCadreExerciceField(
    page,
    value,
    0, // adherent is first (index 0)
    "[7/11] Cadre d'exercice",
    logger
  );
}

/**
 * NOUVEAU pour Santé Pro Plus - Statut professionnel (seulement pour Chefs d'entreprise)
 */
export async function fillStatutProfessionnel(page: Page, value: AlptisStatutProfessionnel, logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling statut professionnel', { value, field: '8/11' });
  await fillStatutProfessionnelField(page, value, logger);
}

export async function fillRegimeObligatoire(page: Page, value: string, logger?: FlowLogger): Promise<void> {
  await fillRegimeObligatoireField(
    page,
    value,
    0, // adherent is first (index 0)
    '[9/11] Régime',
    SECTION_2_SELECTORS.regime_obligatoire.primary,
    logger
  );
}

export async function fillCodePostal(page: Page, codePostal: string, logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling code postal', { codePostal, field: '10/11' });
  await clearAndType(page.locator(SECTION_2_SELECTORS.code_postal.primary), codePostal);
  await verifyTextValue(page, page.locator(SECTION_2_SELECTORS.code_postal.primary), codePostal);
}

/**
 * NOUVEAU pour Santé Pro Plus - Ville (auto-remplie via code postal)
 */
export async function fillVille(page: Page, logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling ville (auto-populated from code postal)', { field: '11/11' });
  await fillVilleField(page, logger);
}
