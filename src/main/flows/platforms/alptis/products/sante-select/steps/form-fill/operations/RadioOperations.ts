import type { Page } from 'playwright';

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
 */
export async function fillCadreExerciceField(
  page: Page,
  value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS',
  fieldIndex: number,
  fieldLabel: string
): Promise<void> {
  console.log(`${fieldLabel}: ${value}`);

  const labelText = CADRE_EXERCICE_LABELS[value];
  if (!labelText) throw new Error(`Label inconnu pour cadre d'exercice: ${value}`);

  const label = page.locator(`label:has-text("${labelText}")`).nth(fieldIndex);
  await label.waitFor({ state: 'visible', timeout: 5000 });
  await label.click();
  console.log(`  ↳ Option "${labelText}" sélectionnée`);
}
