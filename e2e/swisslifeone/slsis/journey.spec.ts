/**
 * Test Journey complet - SwissLife One SLSIS
 * Teste le flow complet : Auth → Navigation → Sections 1-7
 * Les fixtures gèrent automatiquement les sections 1-7 selon le type de lead
 *
 * 5 tests couvrant tous les types de leads :
 * - 🎲 Random
 * - 🧍 Solo (sans conjoint ni enfants)
 * - 👫 Avec conjoint uniquement
 * - 👶 Avec enfants uniquement
 * - 👨‍👩‍👧 Conjoint + Enfants
 */
import { test, expect } from '../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';
import { hasSwissLifeOneCredentials } from '../helpers/credentials';

test.skip(!hasSwissLifeOneCredentials(), 'Credentials manquants dans .env');

test('🎲 Random', async ({ page, formWithStep1Section7, leadData }) => {
    test.setTimeout(180000); // 3 minutes

    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    // All 7 sections are filled by the fixture
    expect(page.url()).toContain('/tarification-et-simulation/slsis');

    const formFill = SwissLifeOneInstances.getFormFillStep();
    const errors = await formFill.checkForErrors(frame);

    const hasConjoint = !!leadData.conjoint;
    const hasEnfants = !!leadData.enfants && leadData.enfants.nombre_enfants > 0;

    console.log(`\n✅ Journey completed for lead: ${leadData.projet.nom_projet}`);
    console.log(`   - Section 1: Nom du projet ✓`);
    console.log(`   - Section 2: Besoins ✓`);
    console.log(`   - Section 3: Type simulation (${leadData.type_simulation}) ✓`);
    console.log(`   - Section 4: Assuré principal ✓`);
    console.log(`   - Section 5: ${hasConjoint ? 'Conjoint ✓' : 'Pas de conjoint (ignorée) ✓'}`);
    console.log(`   - Section 6: ${hasEnfants ? `${leadData.enfants!.nombre_enfants} enfant(s) ✓` : 'Pas d\'enfants (0 sélectionné) ✓'}`);
    console.log(`   - Section 7: Gammes et Options ✓`);
    console.log(`   - Errors found: ${errors.length}\n`);

    expect(errors).toHaveLength(0);
});

test('🧍 Solo (sans conjoint ni enfants)', async ({ page, formWithStep1Section7, leadData }) => {
    test.setTimeout(180000); // 3 minutes

    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    expect(page.url()).toContain('/tarification-et-simulation/slsis');

    const formFill = SwissLifeOneInstances.getFormFillStep();
    const errors = await formFill.checkForErrors(frame);

    const hasConjoint = !!leadData.conjoint;
    const hasEnfants = !!leadData.enfants && leadData.enfants.nombre_enfants > 0;

    console.log(`\n✅ Solo journey completed`);
    console.log(`   - Conjoint: ${hasConjoint ? '❌ UNEXPECTED' : '✓ None'}`);
    console.log(`   - Enfants: ${hasEnfants ? '❌ UNEXPECTED' : '✓ None'}`);
    console.log(`   - Errors: ${errors.length}\n`);

    expect(errors).toHaveLength(0);
});

test('👫 Avec conjoint uniquement', async ({ page, formWithStep1Section7, leadData }) => {
    test.setTimeout(180000); // 3 minutes

    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    expect(page.url()).toContain('/tarification-et-simulation/slsis');

    const formFill = SwissLifeOneInstances.getFormFillStep();
    const errors = await formFill.checkForErrors(frame);

    const hasConjoint = !!leadData.conjoint;
    const hasEnfants = !!leadData.enfants && leadData.enfants.nombre_enfants > 0;

    console.log(`\n✅ Conjoint journey completed`);
    console.log(`   - Conjoint: ${hasConjoint ? '✓ Present' : '❌ UNEXPECTED - Missing conjoint'}`);
    console.log(`   - Enfants: ${hasEnfants ? '❌ UNEXPECTED - Should have no children' : '✓ None'}`);
    console.log(`   - Errors: ${errors.length}\n`);

    expect(errors).toHaveLength(0);
});

test('👶 Avec enfants uniquement', async ({ page, formWithStep1Section7, leadData }) => {
    test.setTimeout(180000); // 3 minutes

    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    expect(page.url()).toContain('/tarification-et-simulation/slsis');

    const formFill = SwissLifeOneInstances.getFormFillStep();
    const errors = await formFill.checkForErrors(frame);

    const hasConjoint = !!leadData.conjoint;
    const hasEnfants = !!leadData.enfants && leadData.enfants.nombre_enfants > 0;

    console.log(`\n✅ Children journey completed`);
    console.log(`   - Conjoint: ${hasConjoint ? '❌ UNEXPECTED - Should have no conjoint' : '✓ None'}`);
    console.log(`   - Enfants: ${hasEnfants ? `✓ ${leadData.enfants!.nombre_enfants} child(ren)` : '❌ UNEXPECTED - Missing children'}`);
    console.log(`   - Errors: ${errors.length}\n`);

    expect(errors).toHaveLength(0);
});

test('👨‍👩‍👧 Conjoint + Enfants', async ({ page, formWithStep1Section7, leadData }) => {
    test.setTimeout(180000); // 3 minutes

    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    expect(page.url()).toContain('/tarification-et-simulation/slsis');

    const formFill = SwissLifeOneInstances.getFormFillStep();
    const errors = await formFill.checkForErrors(frame);

    const hasConjoint = !!leadData.conjoint;
    const hasEnfants = !!leadData.enfants && leadData.enfants.nombre_enfants > 0;

    console.log(`\n✅ Family journey completed`);
    console.log(`   - Conjoint: ${hasConjoint ? '✓ Present' : '❌ UNEXPECTED - Missing conjoint'}`);
    console.log(`   - Enfants: ${hasEnfants ? `✓ ${leadData.enfants!.nombre_enfants} child(ren)` : '❌ UNEXPECTED - Missing children'}`);
    console.log(`   - Errors: ${errors.length}\n`);

    expect(errors).toHaveLength(0);
});
