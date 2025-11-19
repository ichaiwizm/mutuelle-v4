/**
 * Helper pour gérer les credentials de test SwissLife One
 *
 * Les credentials sont lus depuis les variables d'environnement (.env)
 * pour éviter de les commit dans le code.
 *
 * Ce fichier ré-exporte les utilities du config centralisé.
 */

import {
  getSwissLifeOneCredentials as getCredentialsFromConfig,
  SwissLifeOneCredentials,
  SwissLifeOneEnvVars,
} from '../../../src/main/flows/config';

/**
 * Type pour les credentials de test
 * Alias pour compatibilité avec le code existant
 */
export type TestCredentials = SwissLifeOneCredentials;

/**
 * Récupère les credentials SwissLife One depuis l'environnement
 * Utilise le config centralisé
 */
export const getSwissLifeOneCredentials = getCredentialsFromConfig;

/**
 * Vérifie si les credentials de test sont disponibles
 * Utile pour skip les tests si pas de credentials
 */
export function hasSwissLifeOneCredentials(): boolean {
  return !!(
    process.env[SwissLifeOneEnvVars.username] && process.env[SwissLifeOneEnvVars.password]
  );
}
