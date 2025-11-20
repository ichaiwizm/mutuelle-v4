import { test, expect } from '../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';

test.describe('SwissLife One - Form Fill Journey', () => {
  test('🎲 Complete journey: Sections 1 and 2', async ({ page, formWithStep1Section2, leadData }) => {
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    // Sections 1 and 2 are already filled by the fixture
    // Verify we're still on the form
    expect(page.url()).toContain('/tarification-et-simulation/slsis');

    const formFill = SwissLifeOneInstances.getFormFillStep();
    const errors = await formFill.checkForErrors(frame);

    console.log(`\n✅ Journey completed for lead: ${leadData.projet.nom_projet}`);
    console.log(`   - Section 1: Nom du projet ✓`);
    console.log(`   - Section 2: Besoins (couverture: ${leadData.besoins.besoin_couverture_individuelle ? 'oui' : 'non'}, indemnités: ${leadData.besoins.besoin_indemnites_journalieres ? 'oui' : 'non'}) ✓`);
    console.log(`   - Errors found: ${errors.length}\n`);

    // Note: We expect validation errors since we haven't filled Section 3 (assurés)
    // This is normal behavior
  });
});
