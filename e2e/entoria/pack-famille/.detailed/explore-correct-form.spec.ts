import { test } from '@playwright/test';
import { EntoriaAuth } from '../../../../src/main/flows/platforms/entoria/lib';

/**
 * Exploration du bon formulaire TNS Santé
 */
test.describe('Entoria - Correct Form Exploration', () => {
  test('🔍 Explore TNS Santé form', async ({ page }) => {
    test.setTimeout(300000);

    console.log('\n════════════════════════════════════════');
    console.log('   ENTORIA: TNS SANTE FORM EXPLORATION');
    console.log('════════════════════════════════════════\n');

    // Login
    console.log('🔐 Logging in...');
    const credentials = {
      username: process.env.ENTORIA_USERNAME || 'NFRAGOSO',
      password: process.env.ENTORIA_PASSWORD || 'Fragoso0303.',
      courtierCode: process.env.ENTORIA_COURTIER_CODE || '107754',
    };

    const auth = new EntoriaAuth(credentials);
    await auth.login(page);
    await page.waitForTimeout(2000);

    // Navigate directly to the correct form
    console.log('\n🧭 Navigating to TNS Santé form...');
    await page.goto('https://espacecourtier.entoria.fr/tarification/10775400299/profil/tns/sante');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: 'src/main/flows/cartography/entoria/tns-sante-form.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: tns-sante-form.png');

    console.log(`\n📍 Current URL: ${page.url()}`);

    // ARIA Snapshot
    console.log('\n🔍 ARIA Snapshot:');
    const snapshot = await page.locator('body').ariaSnapshot();
    console.log(snapshot);

    // Find all form elements
    console.log('\n🔍 Form elements:');
    const formInputs = await page.locator('input, select, textarea, mat-select').all();
    console.log(`Found ${formInputs.length} form elements:`);

    for (let i = 0; i < Math.min(formInputs.length, 50); i++) {
      const input = formInputs[i];
      const tagName = await input.evaluate(el => el.tagName).catch(() => 'UNKNOWN');
      const id = await input.getAttribute('id').catch(() => null);
      const name = await input.getAttribute('name').catch(() => null);
      const type = await input.getAttribute('type').catch(() => null);
      const placeholder = await input.getAttribute('placeholder').catch(() => null);
      const ariaLabel = await input.getAttribute('aria-label').catch(() => null);
      const isVisible = await input.isVisible().catch(() => false);

      if (isVisible) {
        console.log(`  ${tagName} #${i}: id="${id}", name="${name}", type="${type}", placeholder="${placeholder}", aria-label="${ariaLabel}"`);
      }
    }

    // Find all buttons
    console.log('\n🔍 Buttons:');
    const buttons = await page.locator('button').all();
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const text = await btn.textContent().catch(() => '');
      const isVisible = await btn.isVisible().catch(() => false);
      if (isVisible && text && text.trim()) {
        console.log(`  Button #${i}: "${text.trim()}"`);
      }
    }

    // Find all headings/sections
    console.log('\n🔍 Headings/Sections:');
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    for (const heading of headings) {
      const text = await heading.textContent().catch(() => '');
      const isVisible = await heading.isVisible().catch(() => false);
      if (isVisible && text && text.trim()) {
        console.log(`  → "${text.trim()}"`);
      }
    }

    // Find mat-radio-groups
    console.log('\n🔍 Radio groups:');
    const radioGroups = await page.locator('mat-radio-group').all();
    for (let i = 0; i < radioGroups.length; i++) {
      const group = radioGroups[i];
      const isVisible = await group.isVisible().catch(() => false);
      if (isVisible) {
        const options = await group.locator('mat-radio-button').allTextContents();
        console.log(`  Radio group #${i}: options = [${options.map(o => o.trim()).join(', ')}]`);
      }
    }

    // Find mat-selects
    console.log('\n🔍 Mat-selects (dropdowns):');
    const matSelects = await page.locator('mat-select').all();
    for (let i = 0; i < matSelects.length; i++) {
      const select = matSelects[i];
      const isVisible = await select.isVisible().catch(() => false);
      if (isVisible) {
        const ariaLabel = await select.getAttribute('aria-label').catch(() => null);
        const placeholder = await select.locator('.mat-select-placeholder').textContent().catch(() => null);
        console.log(`  Mat-select #${i}: aria-label="${ariaLabel}", placeholder="${placeholder}"`);
      }
    }

    console.log('\n✅ Exploration complete!');
  });
});
