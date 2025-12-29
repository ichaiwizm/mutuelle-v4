/**
 * Types pour le formulaire Entoria Pack Famille (TNS Santé)
 * Formulaire de tarification en 4 étapes
 */

import type { Lead } from '@/shared/types/lead';

/**
 * Type pour les professions Entoria (options exactes du dropdown)
 * Le dropdown contient 321 options - ceci est un sous-ensemble des plus courantes
 */
export type EntoriaProfession =
  | 'COMMERÇANT'
  | 'ARTISAN DES MÉTIERS DE BOUCHE'
  | 'AGRICULTEUR, ÉLEVEUR'
  | 'GÉRANT, CHEF D\'ENTREPRISE COMMERCIALE'
  | 'GÉRANT, CHEF D\'ENTREPRISE DE SERVICES'
  | 'GÉRANT, CHEF D\'ENTREPRISE DU BÂTIMENT ET DES TRAVAUX PUBLICS'
  | 'MÉDECIN GÉNÉRALISTE'
  | 'PHARMACIEN'
  | 'INFIRMIÈRE PUÉRICULTRICE'
  | 'CHIRURGIEN DENTISTE'
  | 'MASSEUR-KINÉSITHERAPEUTE'
  | 'OSTÉOPATHE, CHIROPRACTEUR, NATUROPATHE, KINÉSIOLOGUE'
  | 'VÉTÉRINAIRE'
  | 'AVOCAT'
  | 'NOTAIRE'
  | 'EXPERT COMPTABLE, COMPTABLE AGRÉÉ'
  | 'ARCHITECTE, DESSINATEUR EN BATIMENT, URBANISTE, ÉCONOMISTE BATIMENT'
  | 'CHEF DE PROJET, INFORMATICIEN'
  | 'DÉVELOPPEUR'
  | 'AUTRE CONSULTANT, COACH (HORS SPORTS)'
  | 'FORMATEUR'
  | 'PLOMBIER, CHAUFFAGISTE'
  | 'INSTALLATEUR BTP, FENÊTRES, VOLETS, PORTAILS'
  | 'MAÇON, PLAQUISTE, PLÂTRIER, CHAPISTE'
  | 'PEINTRE EN BÂTIMENT'
  | 'CHARPENTIER'
  | 'CARRELEUR'
  | 'COUVREUR, TRAVAUX D\'ISOLATION'
  | 'EXPLOITANT DE RESTAURANT, CAFÉ-RESTAURANT, DÉBIT DE BOISSON'
  | 'EXPLOITANT D\'HÔTEL, CAMPING, GITE, HÔTEL-RESTAURANT'
  | 'BOULANGER, PÂTISSIER'
  | 'BOUCHER, CHARCUTIER, POISSONNIER'
  | 'COIFFEUR, MANUCURE, ESTHÉTICIEN'
  | 'TAXI, CHAUFFEUR, VTC'
  | 'AGENT IMMOBILIER'
  | 'DIAGNOSTIQUEUR IMMOBILIER'
  | 'AGENT GÉNÉRAL D\'ASSURANCE'
  | 'COURTIER D\'ASSURANCE'
  | string; // Permet d'autres valeurs du dropdown (321 options au total)

/**
 * Étape 1 : Profil de l'entrepreneur
 */
export interface PackFamilleProfilData {
  date_naissance: string; // DD/MM/YYYY
  profession: string; // Autocomplete value
  exerce_en_tant_que: string; // Conditionnel après profession
  departement_residence: string; // Code département (ex: "75")
  assure_prevoyance_entoria: boolean;
}

/**
 * Étape 2 : Recueil des besoins
 */
export interface PackFamilleBesoinData {
  hospitalisation_uniquement: boolean;
}

/**
 * Étape 3 : Choix des garanties
 */
export interface PackFamilleGarantiesData {
  frequence_reglement: 'Mensuelle' | 'Trimestrielle';
  date_effet: string; // DD/MM/YYYY
  avec_conjoint: boolean;
  avec_enfants: boolean;
  formule_choisie?: 'HOSPI_PLUS_PRO' | 'ECO_PRO' | 'ESSENTIEL_PRO' | 'SECURITE_PRO' | 'CONFORT_PRO' | 'EXCELLENCE_PRO';
}

/**
 * Données complètes du formulaire
 */
export interface PackFamilleFormData {
  profil: PackFamilleProfilData;
  besoin: PackFamilleBesoinData;
  garanties: PackFamilleGarantiesData;
}

/**
 * Résultat de transformation
 */
export type TransformResult = {
  success: boolean;
  data?: PackFamilleFormData;
  errors?: TransformError[];
  warnings?: TransformWarning[];
};

/**
 * Erreur de transformation
 */
export type TransformError = {
  code: string;
  message: string;
  field?: string;
  severity: 'critical' | 'medium' | 'low';
};

/**
 * Warning de transformation
 */
export type TransformWarning = {
  code: string;
  message: string;
  field?: string;
  action: string;
};

/**
 * Export du type Lead
 */
export type { Lead };
