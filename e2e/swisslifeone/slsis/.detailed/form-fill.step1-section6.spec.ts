import { test, expect } from '../../fixtures';
import { createSwissLifeServices } from '@/main/flows/engine/services';
import type { SwissLifeNavigationStep } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/navigation';
import { verifyStep1Section6 } from '../../helpers/verification';

test.describe('SwissLife One - Form Fill - Step 1 Section 6', () => {
  test('Fill "Enfants" fields', async ({ page, formWithStep1Section6, leadData }) => {
    const services = createSwissLifeServices();
    const nav = services.navigation as SwissLifeNavigationStep;
    const frame = await nav.getIframe(page);

    // Fixture already filled Sections 1-6
    await verifyStep1Section6(frame, leadData);

    const nombreEnfants = leadData.enfants?.nombre_enfants || 0;
    console.log(`\n✅ Section 6 test completed with ${nombreEnfants} child${nombreEnfants > 1 ? 'ren' : ''}`);
  });
});
