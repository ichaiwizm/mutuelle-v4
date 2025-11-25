import { test, expect } from '../../fixtures';
import { createSwissLifeServices } from '@/main/flows/engine/services';
import type { SwissLifeNavigationStep } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/navigation';
import type { FormFillOrchestrator } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/FormFillOrchestrator';
import { verifyStep1Section7 } from '../../helpers/verification';

test.describe('SwissLife One - Form Fill - Step 1 Section 7', () => {
  test('Fill "Gammes et Options" fields (final section)', async ({ page, formWithStep1Section7, leadData }) => {
    const services = createSwissLifeServices();
    const nav = services.navigation as SwissLifeNavigationStep;
    const frame = await nav.getIframe(page);

    // Fixture already filled all 7 sections (complete Step 1)
    await verifyStep1Section7(frame, leadData);

    // Verify no errors on complete form
    const formFill = services.formFill as FormFillOrchestrator;
    const errors = await formFill.checkForErrors(frame);
    expect(errors).toHaveLength(0);

    console.log(`\n✅ Section 7 test completed - Step 1 COMPLET`);
    console.log(`   Gamme: ${leadData.gammes_options.gamme}`);
    console.log(`   Date effet: ${leadData.gammes_options.date_effet}`);
    console.log(`   Errors: ${errors.length}`);
  });
});
