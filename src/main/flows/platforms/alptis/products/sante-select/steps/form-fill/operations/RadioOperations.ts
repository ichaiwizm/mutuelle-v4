import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';

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
 * @param fieldIndex - Position (0 for adherent, 1 for conjoint)
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

  // For conjoint (fieldIndex = 1), use .last() to handle cases where adherent doesn't have this field
  const label = fieldIndex === 0
    ? page.locator(`label:has-text("${labelText}")`).first()
    : page.locator(`label:has-text("${labelText}")`).last();

  await label.waitFor({ state: 'visible', timeout: 5000 });
  await label.click();
  logger?.debug(`Radio option selected`, { fieldLabel, labelText });
}
