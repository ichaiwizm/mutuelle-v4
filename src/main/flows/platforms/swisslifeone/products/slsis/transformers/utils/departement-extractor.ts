/**
 * Utilitaire d'extraction de département depuis le code postal
 * Gère les cas particuliers: Corse (2A/2B) et DOM-TOM (97)
 */

import type { DepartementCode } from '../types';

/**
 * Extrait le code département depuis un code postal
 *
 * Logique:
 * - Codes postaux 20xxx (Corse): déterminer 2A ou 2B selon plages
 *   - 20000-20199: 2A (Corse-du-Sud, Ajaccio)
 *   - 20200-20999: 2B (Haute-Corse, Bastia)
 * - Codes postaux 97xxx (DOM-TOM): renvoyer "97"
 * - Autres: extraire les 2 premiers chiffres (01-95)
 *
 * @param codePostal - Code postal français (5 chiffres)
 * @returns Code département (01-95, 2A, 2B, 97)
 * @throws Error si code postal invalide
 */
export function extractDepartement(codePostal: string): DepartementCode {
  // Validation format
  if (!codePostal || !/^\d{5}$/.test(codePostal)) {
    throw new Error(`Invalid postal code format: ${codePostal}. Expected 5 digits.`);
  }

  const postalCodeNum = parseInt(codePostal, 10);

  // Cas 1: Corse (20xxx) - Distinguer 2A et 2B
  if (codePostal.startsWith('20')) {
    // 20000-20199: Corse-du-Sud (2A)
    // Inclut Ajaccio (20000-20090), Porto-Vecchio (20137), Propriano (20110), etc.
    if (postalCodeNum >= 20000 && postalCodeNum < 20200) {
      return '2A';
    }
    // 20200-20999: Haute-Corse (2B)
    // Inclut Bastia (20200-20290), Calvi (20260), Corte (20250), etc.
    else {
      return '2B';
    }
  }

  // Cas 2: DOM-TOM (97xxx) - Tous regroupés sous "97"
  // Guadeloupe (971xx), Martinique (972xx), Guyane (973xx),
  // Réunion (974xx), Mayotte (976xx), etc.
  if (codePostal.startsWith('97')) {
    return '97';
  }

  // Cas 3: France métropolitaine standard (01-95, sauf 20)
  const dept = codePostal.substring(0, 2);

  // Validation que c'est un département valide
  const deptNum = parseInt(dept, 10);
  if (deptNum < 1 || deptNum > 95) {
    console.warn(`[DEPARTEMENT] Unusual department code: ${dept} from postal code ${codePostal}`);
  }

  return dept as DepartementCode;
}

/**
 * Valide qu'un code département est dans la liste des départements acceptés
 */
export function isValidDepartement(dept: string): dept is DepartementCode {
  const VALID_DEPARTMENTS: DepartementCode[] = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '2A',
    '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29',
    '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
    '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
    '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
    '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
    '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
    '90', '91', '92', '93', '94', '95', '97',
  ];

  return VALID_DEPARTMENTS.includes(dept as DepartementCode);
}

/**
 * Mapping des départements vers leurs noms (optionnel, pour logs)
 */
export const DEPARTEMENT_NAMES: Record<DepartementCode, string> = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor', '23': 'Creuse',
  '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
  '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne',
  '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
  '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
  '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
  '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
  '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
  '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
  '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne',
  '95': 'Val-d\'Oise', '97': 'DOM-TOM',
};
