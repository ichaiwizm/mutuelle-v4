/**
 * Mapper pour les professions Entoria TNS Santé
 *
 * Le dropdown profession Entoria contient 321 options très spécifiques.
 * Les valeurs génériques comme "Artisan", "Profession libérale" N'EXISTENT PAS.
 *
 * Pattern aligné sur Alptis et SwissLife.
 */

import type { EntoriaProfession } from '../types';

/**
 * Mapping des professions AssurProspect → Options exactes dropdown Entoria
 * Les options EXACTES ont été capturées via test Playwright
 */
const PROFESSION_MAPPING: Record<string, EntoriaProfession> = {
  // Professions génériques vers options Entoria les plus proches
  'profession libérale': 'GÉRANT, CHEF D\'ENTREPRISE DE SERVICES',
  'artisan': 'ARTISAN DES MÉTIERS DE BOUCHE',
  'commerçant': 'COMMERÇANT',
  'commercant': 'COMMERÇANT',
  'agriculteur': 'AGRICULTEUR, ÉLEVEUR',
  'exploitant agricole': 'AGRICULTEUR, ÉLEVEUR',
  "chef d'entreprise": 'GÉRANT, CHEF D\'ENTREPRISE COMMERCIALE',
  'dirigeant': 'GÉRANT, CHEF D\'ENTREPRISE COMMERCIALE',
  'gérant': 'GÉRANT, CHEF D\'ENTREPRISE COMMERCIALE',
  'gerant': 'GÉRANT, CHEF D\'ENTREPRISE COMMERCIALE',

  // Professions spécifiques médicales
  'médecin': 'MÉDECIN GÉNÉRALISTE',
  'medecin': 'MÉDECIN GÉNÉRALISTE',
  'médecin généraliste': 'MÉDECIN GÉNÉRALISTE',
  'pharmacien': 'PHARMACIEN',
  'infirmier': 'INFIRMIÈRE PUÉRICULTRICE',
  'infirmière': 'INFIRMIÈRE PUÉRICULTRICE',
  'infirmiere': 'INFIRMIÈRE PUÉRICULTRICE',
  'dentiste': 'CHIRURGIEN DENTISTE',
  'chirurgien dentiste': 'CHIRURGIEN DENTISTE',
  'kinésithérapeute': 'MASSEUR-KINÉSITHERAPEUTE',
  'kinesitherapeute': 'MASSEUR-KINÉSITHERAPEUTE',
  'kiné': 'MASSEUR-KINÉSITHERAPEUTE',
  'kine': 'MASSEUR-KINÉSITHERAPEUTE',
  'ostéopathe': 'OSTÉOPATHE, CHIROPRACTEUR, NATUROPATHE, KINÉSIOLOGUE',
  'osteopathe': 'OSTÉOPATHE, CHIROPRACTEUR, NATUROPATHE, KINÉSIOLOGUE',
  'vétérinaire': 'VÉTÉRINAIRE',
  'veterinaire': 'VÉTÉRINAIRE',

  // Professions libérales spécifiques
  'avocat': 'AVOCAT',
  'notaire': 'NOTAIRE',
  'expert comptable': 'EXPERT COMPTABLE, COMPTABLE AGRÉÉ',
  'expert-comptable': 'EXPERT COMPTABLE, COMPTABLE AGRÉÉ',
  'comptable': 'EXPERT COMPTABLE, COMPTABLE AGRÉÉ',
  'architecte': 'ARCHITECTE, DESSINATEUR EN BATIMENT, URBANISTE, ÉCONOMISTE BATIMENT',

  // Services et conseil
  'informaticien': 'CHEF DE PROJET, INFORMATICIEN',
  'développeur': 'DÉVELOPPEUR',
  'developpeur': 'DÉVELOPPEUR',
  'consultant': 'AUTRE CONSULTANT, COACH (HORS SPORTS)',
  'coach': 'AUTRE CONSULTANT, COACH (HORS SPORTS)',
  'formateur': 'FORMATEUR',

  // BTP
  'plombier': 'PLOMBIER, CHAUFFAGISTE',
  'chauffagiste': 'PLOMBIER, CHAUFFAGISTE',
  'électricien': 'INSTALLATEUR BTP, FENÊTRES, VOLETS, PORTAILS',
  'electricien': 'INSTALLATEUR BTP, FENÊTRES, VOLETS, PORTAILS',
  'maçon': 'MAÇON, PLAQUISTE, PLÂTRIER, CHAPISTE',
  'macon': 'MAÇON, PLAQUISTE, PLÂTRIER, CHAPISTE',
  'peintre': 'PEINTRE EN BÂTIMENT',
  'menuisier': 'CHARPENTIER',
  'carreleur': 'CARRELEUR',
  'couvreur': 'COUVREUR, TRAVAUX D\'ISOLATION',

  // Commerce
  'restaurateur': 'EXPLOITANT DE RESTAURANT, CAFÉ-RESTAURANT, DÉBIT DE BOISSON',
  'hôtelier': 'EXPLOITANT D\'HÔTEL, CAMPING, GITE, HÔTEL-RESTAURANT',
  'hotelier': 'EXPLOITANT D\'HÔTEL, CAMPING, GITE, HÔTEL-RESTAURANT',
  'boulanger': 'BOULANGER, PÂTISSIER',
  'boucher': 'BOUCHER, CHARCUTIER, POISSONNIER',
  'coiffeur': 'COIFFEUR, MANUCURE, ESTHÉTICIEN',
  'esthéticienne': 'COIFFEUR, MANUCURE, ESTHÉTICIEN',
  'estheticienne': 'COIFFEUR, MANUCURE, ESTHÉTICIEN',

  // Transport
  'taxi': 'TAXI, CHAUFFEUR, VTC',
  'vtc': 'TAXI, CHAUFFEUR, VTC',
  'chauffeur': 'TAXI, CHAUFFEUR, VTC',

  // Immobilier
  'agent immobilier': 'AGENT IMMOBILIER',
  'diagnostiqueur': 'DIAGNOSTIQUEUR IMMOBILIER',

  // Assurance
  'agent assurance': 'AGENT GÉNÉRAL D\'ASSURANCE',
  'courtier assurance': 'COURTIER D\'ASSURANCE',
};

const DEFAULT_PROFESSION: EntoriaProfession = 'GÉRANT, CHEF D\'ENTREPRISE DE SERVICES';

/**
 * Mappe une profession AssurProspect vers l'option exacte du dropdown Entoria
 */
export function mapProfession(profession: string | undefined): EntoriaProfession {
  if (!profession || profession.trim() === '') {
    console.warn('[ENTORIA PROFESSION] Missing profession, using default:', DEFAULT_PROFESSION);
    return DEFAULT_PROFESSION;
  }

  const normalized = profession.toLowerCase().trim();
  const mapped = PROFESSION_MAPPING[normalized];

  if (!mapped) {
    console.warn(`[ENTORIA PROFESSION] Unknown profession: "${profession}", using default:`, DEFAULT_PROFESSION);
    return DEFAULT_PROFESSION;
  }

  return mapped;
}

/**
 * Liste des professions Entoria les plus courantes (sous-ensemble des 321 options)
 */
export const ENTORIA_COMMON_PROFESSIONS: EntoriaProfession[] = [
  'COMMERÇANT',
  'ARTISAN DES MÉTIERS DE BOUCHE',
  'AGRICULTEUR, ÉLEVEUR',
  'GÉRANT, CHEF D\'ENTREPRISE COMMERCIALE',
  'GÉRANT, CHEF D\'ENTREPRISE DE SERVICES',
  'MÉDECIN GÉNÉRALISTE',
  'PHARMACIEN',
  'AVOCAT',
  'EXPERT COMPTABLE, COMPTABLE AGRÉÉ',
];
