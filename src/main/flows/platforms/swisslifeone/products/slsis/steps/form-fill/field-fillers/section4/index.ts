import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import type { AssurePrincipalData } from '../../../../transformers/types';
import { fillDateNaissanceAssurePrincipal } from './fill-date-naissance';
import { fillDepartementResidence } from './fill-departement';
import { fillRegimeSocial } from './fill-regime';
import { fillProfession } from './fill-profession';
import { fillStatut } from './fill-statut';

// Re-export individual fillers for direct use if needed
export { fillDateNaissanceAssurePrincipal } from './fill-date-naissance';
export { fillDepartementResidence } from './fill-departement';
export { fillRegimeSocial } from './fill-regime';
export { fillProfession } from './fill-profession';
export { fillStatut } from './fill-statut';

/**
 * Fill complete Section 4: Donnees de l'assure principal
 * Fills: date_naissance, departement_residence, regime_social, profession, statut
 */
export async function fillSection4(
  frame: Frame,
  assurePrincipalData: AssurePrincipalData,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Starting Section 4: Donnees de l\'assure principal');

  await fillDateNaissanceAssurePrincipal(frame, assurePrincipalData.date_naissance, logger);
  await fillDepartementResidence(frame, assurePrincipalData.departement_residence, logger);
  await fillRegimeSocial(frame, assurePrincipalData.regime_social, logger);
  await fillProfession(frame, assurePrincipalData.profession, logger);
  await fillStatut(frame, assurePrincipalData.statut, assurePrincipalData.regime_social, logger);

  logger?.info('Section "Donnees de l\'assure principal" completed', {
    section: 'assure_principal',
    fieldsCount: 5
  });
}
