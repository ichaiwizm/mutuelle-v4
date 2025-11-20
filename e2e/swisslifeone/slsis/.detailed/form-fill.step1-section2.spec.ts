import { test, expect } from '../../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';
import { verifyStep1Section2 } from '../../helpers/verification';

test.describe('SwissLife One - Form Fill - Step 1 Section 2', () => {
  test('Fill "Vos projets" fields (coverage needs)', async ({ page, formPage, testData }) => {
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    const formFill = SwissLifeOneInstances.getFormFillStep();
    await formFill.fillStep1(frame, testData);

    // Note: Ne vérifie pas les erreurs car nous n'avons rempli que 2 sections
    // Le formulaire affichera naturellement des messages de validation pour les autres champs

    await verifyStep1Section2(frame, testData);
  });
});
