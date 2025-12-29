/**
 * Test pour capturer les options EXACTES du dropdown profession Entoria
 */

import { test, expect } from '@playwright/test';
import { EntoriaAuth } from '../../../../src/main/flows/platforms/entoria/lib';
import { EntoriaPackFamilleNavigation } from '../../../../src/main/flows/platforms/entoria/products/pack-famille/steps/navigation';

function getEntoriaCredentials() {
  const username = process.env.ENTORIA_USERNAME;
  const password = process.env.ENTORIA_PASSWORD;
  const courtierCode = process.env.ENTORIA_COURTIER_CODE;

  if (!username || !password || !courtierCode) {
    throw new Error('ENTORIA_USERNAME, ENTORIA_PASSWORD and ENTORIA_COURTIER_CODE must be set in .env');
  }

  return { username, password, courtierCode };
}

const mockLogger = {
  info: (msg: string) => console.log(`ℹ️ ${msg}`),
  warn: (msg: string) => console.log(`⚠️ ${msg}`),
  debug: (msg: string) => console.log(`🔍 ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
} as any;

test.describe('Capture Profession Options', () => {
  test('Capturer toutes les options du dropdown profession', async ({ page }) => {
    test.setTimeout(180000);

    console.log('\n════════════════════════════════════════');
    console.log('   CAPTURE OPTIONS PROFESSION ENTORIA');
    console.log('════════════════════════════════════════\n');

    // 1. Authenticate
    console.log('🔐 Authenticating...');
    const credentials = getEntoriaCredentials();
    const auth = new EntoriaAuth(credentials);
    await auth.login(page);
    await page.waitForTimeout(2000);

    // 2. Navigate to form
    console.log('🧭 Navigating to form...');
    const navigation = new EntoriaPackFamilleNavigation();
    await navigation.execute(page, mockLogger);
    await page.waitForTimeout(3000);

    // 3. Click on profession input to open autocomplete
    console.log('📝 Opening profession autocomplete...');
    const professionInput = page.locator("input[placeholder*='Profession']").first();
    await professionInput.waitFor({ state: 'visible', timeout: 10000 });
    await professionInput.click();
    await page.waitForTimeout(1000);

    // 4. Type a single character to trigger the dropdown
    await professionInput.pressSequentially('a', { delay: 100 });
    await page.waitForTimeout(2000);

    // 5. Capture all mat-option elements
    const options = await page.locator('mat-option').all();
    console.log(`\n📋 Found ${options.length} options for "a":\n`);

    const optionTexts: string[] = [];
    for (const option of options) {
      const text = await option.textContent();
      if (text) {
        optionTexts.push(text.trim());
        console.log(`   - "${text.trim()}"`);
      }
    }

    // 6. Clear and try other letters
    await professionInput.clear();
    await page.waitForTimeout(500);

    // Try "p" for "Profession"
    await professionInput.pressSequentially('p', { delay: 100 });
    await page.waitForTimeout(2000);

    const optionsP = await page.locator('mat-option').all();
    console.log(`\n📋 Found ${optionsP.length} options for "p":\n`);
    for (const option of optionsP) {
      const text = await option.textContent();
      if (text) {
        console.log(`   - "${text.trim()}"`);
      }
    }

    // 7. Screenshot
    await page.screenshot({
      path: 'e2e/test-results/entoria-profession-options.png',
      fullPage: true,
    });

    console.log('\n════════════════════════════════════════');
    console.log('   CAPTURE TERMINÉE');
    console.log('════════════════════════════════════════');
  });
});
