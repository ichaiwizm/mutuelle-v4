import { test } from '../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';

test.describe('SwissLife One - Inspect Section 7 HTML', () => {
  test('Get raw HTML of Section 7 after gamme selection', async ({ page, formWithStep1Section6, leadData }) => {
    test.setTimeout(180000);
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    console.log('\n=== Filling gamme and date to trigger Section 7 fields ===\n');

    // Fill gamme
    const gammeSelect = frame.locator('#selection-produit-sante').first();
    await gammeSelect.waitFor({ state: 'visible', timeout: 10000 });
    await gammeSelect.selectOption({ label: 'SwissLife Santé' });
    await frame.waitForTimeout(5000); // Wait for conditional fields to load

    console.log('✅ Gamme selected, waiting for conditional fields...\n');

    // Scroll down to see Section 7
    await frame.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await frame.waitForTimeout(2000);

    // Get HTML of the entire page to see structure
    const bodyHTML = await frame.locator('body').innerHTML();

    // Search for "Reprise" in HTML
    const repriseIndex = bodyHTML.toLowerCase().indexOf('reprise');
    if (repriseIndex !== -1) {
      const snippet = bodyHTML.substring(Math.max(0, repriseIndex - 500), Math.min(bodyHTML.length, repriseIndex + 1500));
      console.log('\n=== HTML around "Reprise" text (2000 chars) ===\n');
      console.log(snippet);
    } else {
      console.log('\n⚠️  "Reprise" text not found in HTML');
    }

    // Search for "Résiliation" in HTML
    const resiliationIndex = bodyHTML.toLowerCase().indexOf('résiliation');
    if (resiliationIndex !== -1) {
      const snippet = bodyHTML.substring(Math.max(0, resiliationIndex - 500), Math.min(bodyHTML.length, resiliationIndex + 1500));
      console.log('\n=== HTML around "Résiliation" text (2000 chars) ===\n');
      console.log(snippet);
    } else {
      console.log('\n⚠️  "Résiliation" text not found in HTML');
    }

    // Count all radio inputs
    const allRadios = frame.locator('input[type="radio"]');
    const radioCount = await allRadios.count();
    console.log(`\n=== Total radio inputs found: ${radioCount} ===\n`);

    // Inspect each radio
    for (let i = 0; i < Math.min(radioCount, 15); i++) {
      const radio = allRadios.nth(i);
      const attrs = await radio.evaluate((el: HTMLInputElement) => ({
        name: el.name,
        value: el.value,
        id: el.id,
        checked: el.checked,
        visible: el.offsetParent !== null,
      }));
      console.log(`Radio ${i}: name="${attrs.name}", value="${attrs.value}", id="${attrs.id}", checked=${attrs.checked}, visible=${attrs.visible}`);
    }

    // Take screenshot
    await page.screenshot({ path: 'e2e/test-results/section7-full-page.png', fullPage: true });
    console.log('\n✅ Screenshot saved: e2e/test-results/section7-full-page.png');
  });
});
