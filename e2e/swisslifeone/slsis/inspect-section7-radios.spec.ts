import { test } from '../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';

test.describe('SwissLife One - Inspect Section 7 Radio Groups', () => {
  test('Inspect all radio groups structure', async ({ page, formWithStep1Section6, leadData }) => {
    test.setTimeout(120000);
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    console.log('\n=== INSPECTION: Radios "oui/non" sur la page ===\n');

    // Count all "oui" text elements
    const allOuiElements = frame.getByText('oui', { exact: true });
    const ouiCount = await allOuiElements.count();
    console.log(`Total "oui" elements found: ${ouiCount}`);

    for (let i = 0; i < ouiCount; i++) {
      const element = allOuiElements.nth(i);
      const isVisible = await element.isVisible();
      const text = await element.textContent();

      console.log(`\n[${i}] "oui" element:`);
      console.log(`  - Visible: ${isVisible}`);
      console.log(`  - Text: "${text}"`);

      // Try to find parent context
      const parent = element.locator('xpath=ancestor::*[contains(@class, "form") or contains(@class, "section") or contains(@class, "field")][1]');
      const parentExists = await parent.count() > 0;
      if (parentExists) {
        const parentHTML = await parent.evaluate((el) => {
          return el.outerHTML.substring(0, 200);
        }).catch(() => 'N/A');
        console.log(`  - Parent HTML (first 200 chars): ${parentHTML}`);
      }
    }

    // Count all "non" text elements
    const allNonElements = frame.getByText('non', { exact: true });
    const nonCount = await allNonElements.count();
    console.log(`\n\nTotal "non" elements found: ${nonCount}`);

    for (let i = 0; i < nonCount; i++) {
      const element = allNonElements.nth(i);
      const isVisible = await element.isVisible();
      const text = await element.textContent();

      console.log(`\n[${i}] "non" element:`);
      console.log(`  - Visible: ${isVisible}`);
      console.log(`  - Text: "${text}"`);
    }

    // Specific search for "Reprise de concurrence"
    console.log('\n\n=== Searching for "Reprise de concurrence" section ===\n');
    const repriseText = frame.getByText('Reprise de concurrence', { exact: false });
    const repriseExists = await repriseText.count() > 0;
    console.log(`"Reprise de concurrence" found: ${repriseExists}`);

    if (repriseExists) {
      const repriseHTML = await repriseText.first().evaluate((el) => {
        // Get parent container
        const container = el.closest('div, fieldset, section');
        return container ? container.outerHTML : el.outerHTML;
      });
      console.log(`Reprise section HTML:\n${repriseHTML}`);
    }

    // Take screenshot
    await page.screenshot({ path: 'e2e/test-results/section7-radios-inspection.png', fullPage: true });
    console.log('\n✅ Screenshot saved: e2e/test-results/section7-radios-inspection.png');
  });
});
