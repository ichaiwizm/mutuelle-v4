import { test } from '../../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';

/**
 * Test d'inspection pour découvrir les sélecteurs de la Section 6 (Enfants)
 * Ce test se connecte au formulaire et sélectionne "1 enfant" pour inspecter
 * les sélecteurs générés dynamiquement
 */
test.describe('Section 6 - Selector Discovery', () => {
  test('🔍 Discover children field selectors', async ({ page, formWithStep1Section5 }) => {
    test.setTimeout(120000);
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    console.log('\n════════════════════════════════════════');
    console.log('   SECTION 6: SELECTOR DISCOVERY');
    console.log('════════════════════════════════════════\n');

    // Step 1: Take snapshot BEFORE selecting nombre_enfants
    console.log('📸 Step 1: Taking snapshot BEFORE selecting children...');
    const snapshotBefore = await frame.locator('body').ariaSnapshot();
    console.log('Snapshot before (first 500 chars):');
    console.log(snapshotBefore.substring(0, 500));

    // Step 2: Select "1 enfant"
    console.log('\n🔄 Step 2: Selecting "1 enfant"...');
    const nombreEnfantsSelect = frame.locator('#sante-nombre-enfant-assures').first();
    await nombreEnfantsSelect.waitFor({ state: 'visible', timeout: 10000 });
    await nombreEnfantsSelect.selectOption({ label: '1' });
    console.log('✅ Selected 1 enfant');

    // Step 3: Wait for dynamic content to load
    console.log('\n⏳ Step 3: Waiting for dynamic fields to appear...');
    await frame.waitForTimeout(3000);

    // Step 4: Take snapshot AFTER selecting nombre_enfants
    console.log('\n📸 Step 4: Taking snapshot AFTER selecting 1 child...');
    const snapshotAfter = await frame.locator('body').ariaSnapshot();

    // Step 5: Search for date input fields
    console.log('\n🔍 Step 5: Searching for date input fields...');
    const dateInputs = frame.locator('input[type="text"]');
    const dateCount = await dateInputs.count();
    console.log(`Found ${dateCount} text inputs (includes dates)`);

    for (let i = 0; i < Math.min(dateCount, 20); i++) {
      const input = dateInputs.nth(i);
      const id = await input.getAttribute('id').catch(() => 'NO_ID');
      const name = await input.getAttribute('name').catch(() => 'NO_NAME');
      const placeholder = await input.getAttribute('placeholder').catch(() => 'NO_PLACEHOLDER');
      const isVisible = await input.isVisible().catch(() => false);

      if (isVisible && (
        id?.toLowerCase().includes('enfant') ||
        id?.toLowerCase().includes('child') ||
        id?.toLowerCase().includes('date') ||
        name?.toLowerCase().includes('enfant') ||
        name?.toLowerCase().includes('date')
      )) {
        console.log(`  → Input #${i}: id="${id}", name="${name}", placeholder="${placeholder}"`);
      }
    }

    // Step 6: Search for combobox/select fields (ayant droit)
    console.log('\n🔍 Step 6: Searching for combobox fields (ayant droit)...');
    const selects = frame.locator('select');
    const selectCount = await selects.count();
    console.log(`Found ${selectCount} select elements`);

    for (let i = 0; i < Math.min(selectCount, 15); i++) {
      const select = selects.nth(i);
      const id = await select.getAttribute('id').catch(() => 'NO_ID');
      const name = await select.getAttribute('name').catch(() => 'NO_NAME');
      const isVisible = await select.isVisible().catch(() => false);

      if (isVisible && (
        id?.toLowerCase().includes('enfant') ||
        id?.toLowerCase().includes('child') ||
        id?.toLowerCase().includes('ayant') ||
        id?.toLowerCase().includes('droit') ||
        name?.toLowerCase().includes('enfant') ||
        name?.toLowerCase().includes('ayant')
      )) {
        console.log(`  → Select #${i}: id="${id}", name="${name}"`);

        // Get options
        const options = await select.locator('option').allTextContents();
        console.log(`     Options: ${options.join(', ')}`);
      }
    }

    // Step 7: Look for table structure
    console.log('\n🔍 Step 7: Searching for table structure...');
    const tables = frame.locator('table');
    const tableCount = await tables.count();
    console.log(`Found ${tableCount} tables`);

    if (tableCount > 0) {
      for (let i = 0; i < tableCount; i++) {
        const table = tables.nth(i);
        const isVisible = await table.isVisible().catch(() => false);
        if (isVisible) {
          const id = await table.getAttribute('id').catch(() => 'NO_ID');
          const rowCount = await table.locator('tr').count();
          console.log(`  → Table #${i}: id="${id}", rows=${rowCount}`);

          // Inspect first data row
          const firstRow = table.locator('tbody tr').first();
          const firstRowExists = await firstRow.count() > 0;
          if (firstRowExists) {
            const cells = firstRow.locator('td');
            const cellCount = await cells.count();
            console.log(`     First row has ${cellCount} cells`);

            for (let j = 0; j < cellCount; j++) {
              const cell = cells.nth(j);
              const cellHtml = await cell.innerHTML().catch(() => 'ERROR');
              console.log(`     Cell ${j}: ${cellHtml.substring(0, 100)}...`);
            }
          }
        }
      }
    }

    // Step 8: Try to find by role
    console.log('\n🔍 Step 8: Searching by ARIA roles...');
    const textboxes = frame.getByRole('textbox');
    const textboxCount = await textboxes.count();
    console.log(`Found ${textboxCount} textbox roles`);

    const comboboxes = frame.getByRole('combobox');
    const comboboxCount = await comboboxes.count();
    console.log(`Found ${comboboxCount} combobox roles`);

    // Step 9: Print full aria snapshot for analysis
    console.log('\n📸 Step 9: Full ARIA snapshot after selecting 1 child:');
    console.log('─'.repeat(80));
    console.log(snapshotAfter);
    console.log('─'.repeat(80));

    console.log('\n✅ Inspection complete!');
  });
});
