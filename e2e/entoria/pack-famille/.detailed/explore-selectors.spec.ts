import { test } from '@playwright/test';
import { EntoriaAuth, EntoriaUrls } from '../../../../src/main/flows/platforms/entoria/lib';

/**
 * Test d'exploration pour découvrir les sélecteurs du formulaire Entoria Pack Famille
 * Ce test se connecte à la plateforme et inspecte la structure du formulaire
 */
test.describe('Entoria Pack Famille - Selector Exploration', () => {
  test('🔍 Explore login page and authentication', async ({ page }) => {
    test.setTimeout(120000);

    console.log('\n════════════════════════════════════════');
    console.log('   ENTORIA: LOGIN PAGE EXPLORATION');
    console.log('════════════════════════════════════════\n');

    // 1. Navigate to login page
    console.log('📸 Step 1: Navigating to login page...');
    await page.goto(EntoriaUrls.login);
    await page.waitForLoadState('networkidle');

    // 2. Take screenshot of login page
    await page.screenshot({
      path: 'src/main/flows/cartography/entoria/login-page.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: login-page.png');

    // 3. Inspect login form structure
    console.log('\n🔍 Step 2: Inspecting login form...');
    const snapshot = await page.locator('body').ariaSnapshot();
    console.log('ARIA Snapshot (first 2000 chars):');
    console.log(snapshot.substring(0, 2000));

    // 4. Find all input fields
    console.log('\n🔍 Step 3: Finding input fields...');
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields:`);

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const id = await input.getAttribute('id').catch(() => null);
      const name = await input.getAttribute('name').catch(() => null);
      const type = await input.getAttribute('type').catch(() => null);
      const placeholder = await input.getAttribute('placeholder').catch(() => null);
      const isVisible = await input.isVisible().catch(() => false);

      console.log(`  Input #${i}: id="${id}", name="${name}", type="${type}", placeholder="${placeholder}", visible=${isVisible}`);
    }

    // 5. Find buttons
    console.log('\n🔍 Step 4: Finding buttons...');
    const buttons = await page.locator('button, input[type="submit"]').all();
    console.log(`Found ${buttons.length} buttons:`);

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const text = await btn.textContent().catch(() => '');
      const type = await btn.getAttribute('type').catch(() => null);
      const isVisible = await btn.isVisible().catch(() => false);

      console.log(`  Button #${i}: text="${text?.trim()}", type="${type}", visible=${isVisible}`);
    }

    console.log('\n✅ Login page exploration complete!');
  });

  test('🔍 Explore form after authentication', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    console.log('\n════════════════════════════════════════');
    console.log('   ENTORIA: FORM EXPLORATION');
    console.log('════════════════════════════════════════\n');

    // 1. Login
    console.log('🔐 Step 1: Logging in...');
    const credentials = {
      username: process.env.ENTORIA_USERNAME || 'NFRAGOSO',
      password: process.env.ENTORIA_PASSWORD || 'Fragoso0303.',
      courtierCode: process.env.ENTORIA_COURTIER_CODE || '107754',
    };

    const auth = new EntoriaAuth(credentials);
    await auth.login(page);

    // 2. Wait for page to load after login
    console.log('\n⏳ Step 2: Waiting for dashboard to load...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take screenshot of dashboard/home
    await page.screenshot({
      path: 'src/main/flows/cartography/entoria/after-login.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: after-login.png');

    // 3. Get current URL
    const currentUrl = page.url();
    console.log(`\n📍 Current URL: ${currentUrl}`);

    // 4. Inspect the page structure
    console.log('\n🔍 Step 3: Inspecting page structure...');
    const snapshot = await page.locator('body').ariaSnapshot();
    console.log('ARIA Snapshot (first 3000 chars):');
    console.log(snapshot.substring(0, 3000));

    // 5. Find navigation/menu items
    console.log('\n🔍 Step 4: Finding navigation elements...');
    const navLinks = await page.locator('a, button').all();
    console.log(`Found ${navLinks.length} clickable elements`);

    // Filter for Pack Famille or related
    const relevantLinks: string[] = [];
    for (let i = 0; i < Math.min(navLinks.length, 50); i++) {
      const link = navLinks[i];
      const text = await link.textContent().catch(() => '');
      const href = await link.getAttribute('href').catch(() => null);
      const isVisible = await link.isVisible().catch(() => false);

      if (isVisible && text && text.trim().length > 0) {
        const textLower = text.toLowerCase();
        if (
          textLower.includes('famille') ||
          textLower.includes('pack') ||
          textLower.includes('devis') ||
          textLower.includes('tarif') ||
          textLower.includes('santé') ||
          textLower.includes('sante') ||
          textLower.includes('nouveau') ||
          textLower.includes('créer') ||
          textLower.includes('creer')
        ) {
          relevantLinks.push(`"${text.trim()}" -> ${href || 'no href'}`);
        }
      }
    }

    if (relevantLinks.length > 0) {
      console.log('\n🎯 Relevant links found:');
      relevantLinks.forEach(link => console.log(`  - ${link}`));
    } else {
      console.log('\n⚠️ No Pack Famille related links found. Showing all visible links...');
      for (let i = 0; i < Math.min(navLinks.length, 30); i++) {
        const link = navLinks[i];
        const text = await link.textContent().catch(() => '');
        const href = await link.getAttribute('href').catch(() => null);
        const isVisible = await link.isVisible().catch(() => false);

        if (isVisible && text && text.trim().length > 0) {
          console.log(`  Link #${i}: "${text.trim().substring(0, 50)}" -> ${href || 'no href'}`);
        }
      }
    }

    // 6. Search for "Pack Famille" product and navigate to it
    console.log('\n🔍 Step 5: Looking for Pack Famille product...');

    // Try common patterns for product navigation
    const productPatterns = [
      'text=Pack Famille',
      'text=pack famille',
      'text=Famille',
      ':text("Pack Famille")',
      'a:has-text("Famille")',
      'button:has-text("Devis")',
      'a:has-text("Devis")',
    ];

    for (const pattern of productPatterns) {
      try {
        const element = page.locator(pattern).first();
        const exists = await element.count() > 0;
        const isVisible = exists ? await element.isVisible().catch(() => false) : false;
        console.log(`  Pattern "${pattern}": exists=${exists}, visible=${isVisible}`);

        if (isVisible) {
          console.log(`    → Found! Clicking...`);
          await element.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          // Take screenshot
          await page.screenshot({
            path: 'src/main/flows/cartography/entoria/after-click-product.png',
            fullPage: true
          });
          console.log('    → Screenshot saved: after-click-product.png');

          // New URL
          console.log(`    → New URL: ${page.url()}`);
          break;
        }
      } catch {
        // Pattern didn't match
      }
    }

    // 7. Final page inspection
    console.log('\n🔍 Step 6: Final page inspection...');
    const finalSnapshot = await page.locator('body').ariaSnapshot();
    console.log('Final ARIA Snapshot:');
    console.log(finalSnapshot);

    // Look for form elements
    console.log('\n🔍 Step 7: Looking for form elements...');
    const formInputs = await page.locator('input, select, textarea').all();
    console.log(`Found ${formInputs.length} form elements:`);

    for (let i = 0; i < Math.min(formInputs.length, 30); i++) {
      const input = formInputs[i];
      const tagName = await input.evaluate(el => el.tagName).catch(() => 'UNKNOWN');
      const id = await input.getAttribute('id').catch(() => null);
      const name = await input.getAttribute('name').catch(() => null);
      const type = await input.getAttribute('type').catch(() => null);
      const placeholder = await input.getAttribute('placeholder').catch(() => null);
      const isVisible = await input.isVisible().catch(() => false);

      if (isVisible) {
        console.log(`  ${tagName} #${i}: id="${id}", name="${name}", type="${type}", placeholder="${placeholder}"`);
      }
    }

    console.log('\n✅ Form exploration complete!');
    console.log('\n📸 Check screenshots in src/main/flows/cartography/entoria/');
  });
});
