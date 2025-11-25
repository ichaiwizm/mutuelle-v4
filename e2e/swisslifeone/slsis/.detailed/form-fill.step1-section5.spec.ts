import { test, expect } from '../../fixtures';
import { createSwissLifeServices } from '@/main/flows/engine/services';
import type { SwissLifeNavigationStep } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/navigation';
import { verifyStep1Section5 } from '../../helpers/verification';

test.describe('SwissLife One - Form Fill - Step 1 Section 5', () => {
  test('Fill "Données du conjoint" fields', async ({ page, formWithStep1Section5, leadData }) => {
    const services = createSwissLifeServices();
    const nav = services.navigation as SwissLifeNavigationStep;
    const frame = await nav.getIframe(page);

    // Fixture already filled Sections 1-5
    await verifyStep1Section5(frame, leadData);

    if (leadData.conjoint) {
      console.log(`\n✅ Section 5 test completed with conjoint data`);
    } else {
      console.log(`\n✅ Section 5 test completed (no conjoint)`);
    }
  });
});
