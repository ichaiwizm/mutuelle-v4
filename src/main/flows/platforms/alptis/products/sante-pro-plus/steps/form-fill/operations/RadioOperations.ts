import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import type { AlptisStatutProfessionnel } from '../../../transformers/types';
import { STATUT_PROFESSIONNEL_LABELS } from '../helpers/form-labels';

/**
 * Cadre d'exercice label mappings
 */
const CADRE_EXERCICE_LABELS: Record<string, string> = {
  SALARIE: 'Salarié',
  INDEPENDANT_PRESIDENT_SASU_SAS: 'Indépendant Président SASU/SAS',
};

/**
 * Generic function to fill "Cadre d'exercice" radio button field
 *
 * @param page - Playwright page object
 * @param value - The cadre d'exercice value
 * @param fieldIndex - Position (0 for adherent, this is the only one in Santé Pro Plus)
 * @param fieldLabel - Label for logging purposes
 * @param logger - Optional FlowLogger instance
 */
export async function fillCadreExerciceField(
  page: Page,
  value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS',
  fieldIndex: number,
  fieldLabel: string,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug(`Filling ${fieldLabel}`, { fieldLabel, value, fieldIndex });

  const labelText = CADRE_EXERCICE_LABELS[value];
  if (!labelText) throw new Error(`Label inconnu pour cadre d'exercice: ${value}`);

  // Use first() for adherent (fieldIndex = 0)
  const label = fieldIndex === 0
    ? page.locator(`label:has-text("${labelText}")`).first()
    : page.locator(`label:has-text("${labelText}")`).last();

  await label.waitFor({ state: 'visible', timeout: 5000 });
  await label.click();
  logger?.debug(`Radio option selected`, { fieldLabel, labelText });
}

/**
 * Fill "Statut professionnel" radio button field (NOUVEAU pour Santé Pro Plus)
 * Visible UNIQUEMENT pour "Chefs d'entreprise"
 *
 * @param page - Playwright page object
 * @param value - The statut professionnel value
 * @param logger - Optional FlowLogger instance
 */
export async function fillStatutProfessionnelField(
  page: Page,
  value: AlptisStatutProfessionnel,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Filling Statut professionnel', { value });

  const labelText = STATUT_PROFESSIONNEL_LABELS[value];
  if (!labelText) throw new Error(`Label inconnu pour statut professionnel: ${value}`);

  const label = page.locator(`label:has-text("${labelText}")`).first();

  await label.waitFor({ state: 'visible', timeout: 5000 });
  await label.click();
  logger?.debug('Statut professionnel selected', { labelText });
}

/**
 * Fill "Micro-entrepreneur" radio button field (NOUVEAU pour Santé Pro Plus)
 * Toujours visible
 *
 * @param page - Playwright page object
 * @param value - 'Oui' ou 'Non'
 * @param logger - Optional FlowLogger instance
 */
export async function fillMicroEntrepreneurField(
  page: Page,
  value: 'Oui' | 'Non',
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Filling Micro-entrepreneur', { value });

  // Find the Micro-entrepreneur section and click the appropriate button
  const label = page.locator(`label:has-text("Micro-entrepreneur")`).first();
  await label.waitFor({ state: 'visible', timeout: 5000 });

  // The button should be near the label
  const button = page.locator(`button:has-text("${value}")`).first();
  await button.click();

  logger?.debug('Micro-entrepreneur selected', { value });
}
