/**
 * Helper pour gérer les credentials de test
 *
 * Les credentials sont lus depuis les variables d'environnement (.env)
 * pour éviter de les commit dans le code.
 */

export interface TestCredentials {
  username: string;
  password: string;
}

/**
 * Récupère les credentials Alptis depuis l'environnement
 */
export function getAlptisCredentials(): TestCredentials {
  const username = process.env.ALPTIS_TEST_USERNAME;
  const password = process.env.ALPTIS_TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Missing test credentials. Please set ALPTIS_TEST_USERNAME and ALPTIS_TEST_PASSWORD in .env file'
    );
  }

  return { username, password };
}

/**
 * Vérifie si les credentials de test sont disponibles
 * Utile pour skip les tests si pas de credentials
 */
export function hasAlptisCredentials(): boolean {
  return !!(process.env.ALPTIS_TEST_USERNAME && process.env.ALPTIS_TEST_PASSWORD);
}
