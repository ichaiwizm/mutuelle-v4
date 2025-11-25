import { test, expect } from '../../fixtures';
import { createSwissLifeServices } from '@/main/flows/engine/services';
import type { SwissLifeNavigationStep } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/navigation';
import type { FormFillOrchestrator } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/FormFillOrchestrator';
import { verifyStep1Section2 } from '../../helpers/verification';

test.describe('SwissLife One - Form Fill - Step 1 Section 2', () => {
  test('Fill "Vos projets" fields (coverage needs)', async ({ page, formPage, leadData }) => {
    const services = createSwissLifeServices();
    const nav = services.navigation as SwissLifeNavigationStep;
    const frame = await nav.getIframe(page);

    const formFill = services.formFill as FormFillOrchestrator;
    await formFill.fillStep1(frame, leadData);

    // Note: Ne vérifie pas les erreurs car nous n'avons rempli que 2 sections
    // Le formulaire affichera naturellement des messages de validation pour les autres champs

    await verifyStep1Section2(frame, leadData);
  });
});
