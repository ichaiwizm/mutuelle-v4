import { test } from '@playwright/test';
import { EntoriaAuth } from '../../../../src/main/flows/platforms/entoria/lib';

/**
 * Exploration complète de toutes les étapes du formulaire TNS Santé
 */
test.describe('Entoria - All Steps Exploration', () => {
  test('🔍 Explore all 4 steps of TNS Santé form', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes

    console.log('\n════════════════════════════════════════');
    console.log('   ENTORIA: TNS SANTE - ALL STEPS');
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

    // Navigate to form
    console.log('\n🧭 Navigating to TNS Santé form...');
    await page.goto('https://espacecourtier.entoria.fr/tarification/10775400299/profil/tns/sante');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // ═══════════════════════════════════════
    // STEP 1: PROFIL
    // ═══════════════════════════════════════
    console.log('\n═══════════════════════════════════════');
    console.log('   STEP 1: PROFIL');
    console.log('═══════════════════════════════════════');

    // Fill step 1
    console.log('Filling step 1...');

    // Date de naissance
    const dateInput = page.locator("input[placeholder*='Date de naissance']").first();
    await dateInput.fill('15/06/1985');
    console.log('  → Date de naissance: 15/06/1985');

    // Profession - it's a combobox/autocomplete
    const professionInput = page.locator("input[placeholder*='Profession']").first();
    await professionInput.click();
    await professionInput.fill('Artisan');
    await page.waitForTimeout(1000);
    // Select from autocomplete
    const option = page.locator('mat-option').first();
    if (await option.isVisible()) {
      await option.click();
      console.log('  → Profession: Artisan (selected from autocomplete)');
    }

    await page.waitForTimeout(1000);

    // Le client exerce en tant que - conditional field that appears after profession
    const exerceInput = page.locator("input[placeholder*='Le client exerce en tant que']").first();
    if (await exerceInput.isVisible()) {
      await exerceInput.click();
      await page.waitForTimeout(500);
      // Select first option from autocomplete
      const exerceOption = page.locator('mat-option').first();
      if (await exerceOption.isVisible()) {
        const exerceText = await exerceOption.textContent();
        await exerceOption.click();
        console.log(`  → Le client exerce en tant que: ${exerceText?.trim()}`);
      }
    }

    await page.waitForTimeout(500);

    // Département - it's a mat-select
    const deptSelect = page.locator("mat-select[aria-label*='Département']").first();
    await deptSelect.click();
    await page.waitForTimeout(500);
    const deptOption = page.locator('mat-option:has-text("75")').first();
    if (await deptOption.isVisible()) {
      await deptOption.click();
      console.log('  → Département: 75');
    } else {
      // Try typing in search
      await page.keyboard.type('75');
      await page.waitForTimeout(500);
      await page.locator('mat-option').first().click();
    }

    // Prévoyance Entoria - select Non
    const prevNon = page.locator('mat-radio-button:has-text("Non")').first();
    await prevNon.click();
    console.log('  → Prévoyance Entoria: Non');

    await page.waitForTimeout(1000);

    // Screenshot step 1 filled
    await page.screenshot({
      path: 'src/main/flows/cartography/entoria/step1-filled.png',
      fullPage: true
    });

    // Click CONTINUER
    const continuerBtn = page.locator('button:has-text("CONTINUER")');
    await continuerBtn.waitFor({ state: 'visible' });

    // Wait for button to be enabled
    await page.waitForTimeout(2000);
    const isDisabled = await continuerBtn.isDisabled();
    console.log(`  → CONTINUER button disabled: ${isDisabled}`);

    if (!isDisabled) {
      await continuerBtn.click();
      console.log('  → Clicked CONTINUER');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    } else {
      console.log('  ⚠️ Button still disabled, checking what is missing...');
      // Take screenshot to see what's wrong
      await page.screenshot({
        path: 'src/main/flows/cartography/entoria/step1-incomplete.png',
        fullPage: true
      });
    }

    // ═══════════════════════════════════════
    // STEP 2: BESOIN
    // ═══════════════════════════════════════
    console.log('\n═══════════════════════════════════════');
    console.log('   STEP 2: BESOIN');
    console.log('═══════════════════════════════════════');

    console.log(`Current URL: ${page.url()}`);

    // Take screenshot
    await page.screenshot({
      path: 'src/main/flows/cartography/entoria/step2-besoin.png',
      fullPage: true
    });

    // ARIA snapshot
    const step2Snapshot = await page.locator('body').ariaSnapshot();
    console.log('ARIA Snapshot (first 3000 chars):');
    console.log(step2Snapshot.substring(0, 3000));

    // Find form elements
    console.log('\nForm elements on step 2:');
    const step2Inputs = await page.locator('input:visible, mat-select:visible, mat-radio-group:visible').all();
    for (let i = 0; i < step2Inputs.length; i++) {
      const el = step2Inputs[i];
      const tagName = await el.evaluate(e => e.tagName);
      const placeholder = await el.getAttribute('placeholder').catch(() => null);
      const ariaLabel = await el.getAttribute('aria-label').catch(() => null);
      console.log(`  ${i}: ${tagName} - placeholder="${placeholder}", aria-label="${ariaLabel}"`);
    }

    // Look for next button
    const step2Next = page.locator('button:has-text("suivant"), button:has-text("CONTINUER")').first();
    if (await step2Next.isVisible()) {
      console.log('\n→ Found next button, clicking...');
      await step2Next.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    }

    // ═══════════════════════════════════════
    // STEP 3: GARANTIES ENTREPRENEUR
    // ═══════════════════════════════════════
    console.log('\n═══════════════════════════════════════');
    console.log('   STEP 3: GARANTIES ENTREPRENEUR');
    console.log('═══════════════════════════════════════');

    console.log(`Current URL: ${page.url()}`);

    await page.screenshot({
      path: 'src/main/flows/cartography/entoria/step3-garanties.png',
      fullPage: true
    });

    const step3Snapshot = await page.locator('body').ariaSnapshot();
    console.log('ARIA Snapshot (first 3000 chars):');
    console.log(step3Snapshot.substring(0, 3000));

    console.log('\n✅ Exploration complete!');
  });
});
