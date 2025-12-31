/**
 * Profession mappings for Entoria Pack Famille
 * Maps generic profession names to exact Entoria dropdown values
 */

export const PROFESSION_MAPPING: Record<string, string> = {
  // Generic professions
  'profession liberale': "GERANT, CHEF D'ENTREPRISE DE SERVICES",
  'artisan': 'ARTISAN DES METIERS DE BOUCHE',
  'commercant': 'COMMERCANT',
  'commerçant': 'COMMERCANT',
  'agriculteur': 'AGRICULTEUR, ELEVEUR',
  'exploitant agricole': 'AGRICULTEUR, ELEVEUR',
  "chef d'entreprise": "GERANT, CHEF D'ENTREPRISE COMMERCIALE",
  'dirigeant': "GERANT, CHEF D'ENTREPRISE COMMERCIALE",
  'gerant': "GERANT, CHEF D'ENTREPRISE COMMERCIALE",

  // Medical professions
  'medecin': 'MEDECIN GENERALISTE',
  'médecin': 'MEDECIN GENERALISTE',
  'medecin generaliste': 'MEDECIN GENERALISTE',
  'pharmacien': 'PHARMACIEN',
  'infirmier': 'INFIRMIERE PUERICULTRICE',
  'infirmiere': 'INFIRMIERE PUERICULTRICE',
  'dentiste': 'CHIRURGIEN DENTISTE',
  'chirurgien dentiste': 'CHIRURGIEN DENTISTE',
  'kinesitherapeute': 'MASSEUR-KINESITHERAPEUTE',
  'kiné': 'MASSEUR-KINESITHERAPEUTE',
  'osteopathe': 'OSTEOPATHE, CHIROPRACTEUR, NATUROPATHE, KINESIOLOGUE',
  'veterinaire': 'VETERINAIRE',

  // Legal & accounting
  'avocat': 'AVOCAT',
  'notaire': 'NOTAIRE',
  'expert comptable': 'EXPERT COMPTABLE, COMPTABLE AGREE',
  'expert-comptable': 'EXPERT COMPTABLE, COMPTABLE AGREE',
  'comptable': 'EXPERT COMPTABLE, COMPTABLE AGREE',
  'architecte': 'ARCHITECTE, DESSINATEUR EN BATIMENT, URBANISTE',

  // IT & consulting
  'informaticien': 'CHEF DE PROJET, INFORMATICIEN',
  'developpeur': 'DEVELOPPEUR',
  'développeur': 'DEVELOPPEUR',
  'consultant': 'AUTRE CONSULTANT, COACH (HORS SPORTS)',
  'coach': 'AUTRE CONSULTANT, COACH (HORS SPORTS)',
  'formateur': 'FORMATEUR',

  // Construction
  'plombier': 'PLOMBIER, CHAUFFAGISTE',
  'chauffagiste': 'PLOMBIER, CHAUFFAGISTE',
  'electricien': 'INSTALLATEUR BTP, FENETRES, VOLETS, PORTAILS',
  'macon': 'MACON, PLAQUISTE, PLATRIER, CHAPISTE',
  'maçon': 'MACON, PLAQUISTE, PLATRIER, CHAPISTE',
  'peintre': 'PEINTRE EN BATIMENT',
  'menuisier': 'CHARPENTIER',
  'carreleur': 'CARRELEUR',
  'couvreur': "COUVREUR, TRAVAUX D'ISOLATION",

  // Commerce & hospitality
  'restaurateur': 'EXPLOITANT DE RESTAURANT, CAFE-RESTAURANT, DEBIT DE BOISSON',
  'hotelier': "EXPLOITANT D'HOTEL, CAMPING, GITE, HOTEL-RESTAURANT",
  'boulanger': 'BOULANGER, PATISSIER',
  'boucher': 'BOUCHER, CHARCUTIER, POISSONNIER',
  'coiffeur': 'COIFFEUR, MANUCURE, ESTHETICIEN',
  'estheticienne': 'COIFFEUR, MANUCURE, ESTHETICIEN',

  // Transport
  'taxi': 'TAXI, CHAUFFEUR, VTC',
  'vtc': 'TAXI, CHAUFFEUR, VTC',
  'chauffeur': 'TAXI, CHAUFFEUR, VTC',

  // Real estate & insurance
  'agent immobilier': 'AGENT IMMOBILIER',
  'diagnostiqueur': 'DIAGNOSTIQUEUR IMMOBILIER',
  'agent assurance': "AGENT GENERAL D'ASSURANCE",
  'courtier assurance': "COURTIER D'ASSURANCE",
};

export const DEFAULT_PROFESSION = "GERANT, CHEF D'ENTREPRISE DE SERVICES";

/** Common professions subset */
export const COMMON_PROFESSIONS = [
  'COMMERCANT',
  'ARTISAN DES METIERS DE BOUCHE',
  'AGRICULTEUR, ELEVEUR',
  "GERANT, CHEF D'ENTREPRISE COMMERCIALE",
  "GERANT, CHEF D'ENTREPRISE DE SERVICES",
  'MEDECIN GENERALISTE',
  'PHARMACIEN',
  'AVOCAT',
  'EXPERT COMPTABLE, COMPTABLE AGREE',
];
