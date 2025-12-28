import { test } from '@playwright/test';
import { EntoriaAuth } from '../../../../src/main/flows/platforms/entoria/lib';

/**
 * Test d'exploration pour trouver le produit "Pack Famille" dans les menus Entoria
 */
test.describe('Entoria - Menu Exploration', () => {
  test('🔍 Explore Offres menu to find Pack Famille', async ({ page }) => {
    test.setTimeout(300000);

    console.log('\n════════════════════════════════════════');
    console.log('   ENTORIA: MENU EXPLORATION');
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

    // Look for "Offres" menu
    console.log('\n🔍 Step 1: Looking for "Offres" menu...');

    // Try to find and click on Offres
    const offresLink = page.locator('text=Offres').first();
    const offresExists = await offresLink.count() > 0;
    console.log(`Offres link exists: ${offresExists}`);

    if (offresExists) {
      console.log('→ Clicking on "Offres"...');
      await offresLink.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'src/main/flows/cartography/entoria/offres-menu.png',
        fullPage: true
      });

      // Check ARIA snapshot
      const snapshot = await page.locator('body').ariaSnapshot();
      console.log('\nARIA Snapshot after clicking Offres:');
      console.log(snapshot.substring(0, 4000));

      // Look for Pack Famille or Santé related items
      const packFamillePatterns = [
        'text=Pack Famille',
        'text=pack famille',
        'text=Famille',
        ':text("Pack")',
        'text=Santé Famille',
        'text=Santé particulier',
        'text=Particulier',
      ];

      console.log('\n🔍 Step 2: Searching for Pack Famille...');
      for (const pattern of packFamillePatterns) {
        try {
          const element = page.locator(pattern);
          const count = await element.count();
          const isVisible = count > 0 ? await element.first().isVisible().catch(() => false) : false;
          console.log(`  Pattern "${pattern}": count=${count}, visible=${isVisible}`);
        } catch {
          // Ignore
        }
      }
    }

    // Also try exploring the main content
    console.log('\n🔍 Step 3: Exploring "Assurances de personnes individuelles"...');

    const santeSection = page.locator('text=Assurances de personnes individuelles');
    if (await santeSection.count() > 0) {
      // Look for items in this section
      const items = page.locator('text=/Santé|Famille|Pack/i');
      const itemCount = await items.count();
      console.log(`Found ${itemCount} relevant items`);

      for (let i = 0; i < Math.min(itemCount, 10); i++) {
        const item = items.nth(i);
        const text = await item.textContent().catch(() => '');
        const isVisible = await item.isVisible().catch(() => false);
        if (isVisible && text) {
          console.log(`  → "${text.trim()}"`);
        }
      }
    }

    // Try clicking on "Santé TNS" to see if it has family options
    console.log('\n🔍 Step 4: Exploring Santé TNS product...');
    const santeTNS = page.locator('text=Santé TNS').first();
    if (await santeTNS.isVisible()) {
      console.log('→ Clicking on "Santé TNS"...');
      await santeTNS.click();
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'src/main/flows/cartography/entoria/sante-tns-page.png',
        fullPage: true
      });

      console.log(`\n📍 Current URL: ${page.url()}`);

      const snapshot2 = await page.locator('body').ariaSnapshot();
      console.log('\nARIA Snapshot of Santé TNS page:');
      console.log(snapshot2.substring(0, 5000));

      // Look for form elements
      console.log('\n🔍 Looking for form elements...');
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
    }

    // Go back and try to find other links
    console.log('\n🔍 Step 5: Looking for all product links on homepage...');
    await page.goto('https://espacecourtier.entoria.fr/accueil');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get all links
    const allLinks = await page.locator('a').all();
    console.log(`Found ${allLinks.length} links total`);

    const relevantLinks: string[] = [];
    for (const link of allLinks) {
      const text = await link.textContent().catch(() => '');
      const href = await link.getAttribute('href').catch(() => null);
      const isVisible = await link.isVisible().catch(() => false);

      if (isVisible && text && text.trim().length > 2) {
        relevantLinks.push(`"${text.trim().substring(0, 50)}" -> ${href || 'no href'}`);
      }
    }

    console.log('\nAll visible links:');
    relevantLinks.slice(0, 30).forEach(link => console.log(`  ${link}`));

    console.log('\n✅ Menu exploration complete!');
  });
});
