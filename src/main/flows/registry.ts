/**
 * Registry simple pour les instances de flow
 *
 * Ce registry permet d'éviter de recréer les instances à chaque fois,
 * en les mettant en cache avec un pattern singleton.
 */

import { FormFillOrchestrator } from './platforms/alptis/products/sante-select/steps/form-fill/FormFillOrchestrator';
import { NavigationStep } from './platforms/alptis/products/sante-select/steps/navigation';
import { AlptisAuth } from './platforms/alptis/lib/AlptisAuth';
import { SwissLifeOneAuth } from './platforms/swisslifeone/lib/SwissLifeOneAuth';
import { SwissLifeNavigationStep } from './platforms/swisslifeone/products/slsis/steps/navigation';
import { getAlptisCredentials, getSwissLifeOneCredentials } from './config';

/**
 * Registry générique pour stocker des instances
 */
class FlowRegistry {
  private instances = new Map<string, any>();

  /**
   * Récupère une instance depuis le cache, ou la crée si elle n'existe pas
   *
   * @param key - Clé unique pour identifier l'instance
   * @param factory - Fonction factory pour créer l'instance si elle n'existe pas
   * @returns L'instance (depuis le cache ou nouvellement créée)
   */
  get<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key) as T;
  }

  /**
   * Supprime une ou toutes les instances du cache
   *
   * @param key - Clé de l'instance à supprimer (optionnel, supprime tout si omis)
   */
  reset(key?: string): void {
    if (key) {
      this.instances.delete(key);
    } else {
      this.instances.clear();
    }
  }
}

/**
 * Instance singleton du registry
 */
export const registry = new FlowRegistry();

/**
 * Helpers pour obtenir les instances Alptis
 *
 * Ces helpers fournissent un accès simplifié aux instances
 * du flow Alptis Santé Select via le registry.
 *
 * Utilisation:
 * ```typescript
 * const auth = AlptisInstances.getAuth();
 * await auth.login(page);
 *
 * const nav = AlptisInstances.getNavigationStep();
 * await nav.execute(page);
 *
 * const formFill = AlptisInstances.getFormFillStep();
 * await formFill.fillMiseEnPlace(page, data);
 * ```
 */
export const AlptisInstances = {
  /**
   * Récupère l'instance AlptisAuth (avec credentials depuis l'environnement)
   */
  getAuth: () => registry.get('alptis-auth', () => new AlptisAuth(getAlptisCredentials())),

  /**
   * Récupère l'instance NavigationStep
   */
  getNavigationStep: () => registry.get('alptis-navigation', () => new NavigationStep()),

  /**
   * Récupère l'instance FormFillOrchestrator (alias: FormFillStep)
   */
  getFormFillStep: () => registry.get('alptis-form-fill', () => new FormFillOrchestrator()),

  /**
   * Réinitialise toutes les instances Alptis du registry
   * Utile pour forcer la recréation des instances entre les tests
   */
  reset: () => {
    registry.reset('alptis-auth');
    registry.reset('alptis-navigation');
    registry.reset('alptis-form-fill');
  },
};

/**
 * Helpers pour obtenir les instances SwissLife One
 *
 * Ces helpers fournissent un accès simplifié aux instances
 * du flow SwissLife One SLSIS via le registry.
 *
 * Utilisation:
 * ```typescript
 * const auth = SwissLifeOneInstances.getAuth();
 * await auth.login(page);
 *
 * const nav = SwissLifeOneInstances.getNavigationStep();
 * await nav.execute(page);
 * ```
 */
export const SwissLifeOneInstances = {
  /**
   * Récupère l'instance SwissLifeOneAuth (avec credentials depuis l'environnement)
   */
  getAuth: () =>
    registry.get('swisslifeone-auth', () => new SwissLifeOneAuth(getSwissLifeOneCredentials())),

  /**
   * Récupère l'instance SwissLifeNavigationStep
   */
  getNavigationStep: () =>
    registry.get('swisslifeone-navigation', () => new SwissLifeNavigationStep()),

  /**
   * Réinitialise toutes les instances SwissLife One du registry
   * Utile pour forcer la recréation des instances entre les tests
   */
  reset: () => {
    registry.reset('swisslifeone-auth');
    registry.reset('swisslifeone-navigation');
  },
};
