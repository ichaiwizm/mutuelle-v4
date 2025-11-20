import { test, expect } from '../../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';

test.describe('SwissLife One - Form Fill - Step 1 Section 4', () => {
  test('Fill "Données de l\'assuré principal" - Date de naissance field', async ({ page, formWithStep1Section3, leadData }) => {
    test.setTimeout(60000); // Increase timeout to 60s for this test
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    const formFill = SwissLifeOneInstances.getFormFillStep();
    await formFill.fillStep1Section4(frame, leadData);

    // Verify the date was filled correctly
    const dateField = frame.locator('#date-naissance-assure-principal');
    await expect(dateField).toBeVisible();
    await expect(dateField).toHaveValue(leadData.assure_principal.date_naissance);

    console.log(`✅ Date de naissance remplie: ${leadData.assure_principal.date_naissance}`);
  });
});
