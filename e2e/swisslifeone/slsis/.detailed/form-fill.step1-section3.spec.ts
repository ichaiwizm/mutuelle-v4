import { test, expect } from '../../fixtures';
import { createSwissLifeServices } from '@/main/flows/engine/services';
import type { SwissLifeNavigationStep } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/navigation';
import { verifyStep1Section3 } from '../../helpers/verification';

test.describe('SwissLife One - Form Fill - Step 1 Section 3', () => {
  test('Fill "Type de simulation" field', async ({ page, formWithStep1Section3, leadData }) => {
    const services = createSwissLifeServices();
    const nav = services.navigation as SwissLifeNavigationStep;
    const frame = await nav.getIframe(page);

    // Fixture already filled Sections 1-3
    await verifyStep1Section3(frame, leadData);

    console.log(`\n✅ Section 3 test completed for type: ${leadData.type_simulation}`);
  });
});
