import { test, expect } from '../../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';
import { verifyStep1Section3 } from '../../helpers/verification';

test.describe('SwissLife One - Form Fill - Step 1 Section 3', () => {
  test('Fill "Type de simulation" field', async ({ page, formWithStep1Section3, leadData }) => {
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    // Fixture already filled Sections 1-3
    await verifyStep1Section3(frame, leadData);

    console.log(`\n✅ Section 3 test completed for type: ${leadData.type_simulation}`);
  });
});
