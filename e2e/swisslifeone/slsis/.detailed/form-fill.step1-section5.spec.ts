import { test, expect } from '../../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';
import { verifyStep1Section5 } from '../../helpers/verification';

test.describe('SwissLife One - Form Fill - Step 1 Section 5', () => {
  test('Fill "Données du conjoint" fields', async ({ page, formWithStep1Section5, leadData }) => {
    const nav = SwissLifeOneInstances.getNavigationStep();
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
