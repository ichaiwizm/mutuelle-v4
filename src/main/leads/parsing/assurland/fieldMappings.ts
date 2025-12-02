/**
 * Field name mappings from Assurland to internal names
 */
export const FIELD_MAPPINGS: Record<string, string> = {
  // Contact fields
  'civilite': 'civilite',
  'nom': 'nom',
  'prenom': 'prenom',
  'v4': 'adresse', // Assurland uses v4 for address
  'code postal': 'codePostal',
  'ville': 'ville',
  'telephone portable': 'telephone',
  'telephone domicile': 'telephoneDomicile',
  'email': 'email',

  // Souscripteur fields
  'date de naissance': 'dateNaissance',
  'age': 'age',
  'sexe': 'sexe',
  'profession': 'profession',
  'regime social': 'regimeSocial',
  'situation familiale': 'situationFamiliale',
  'nombre d\'enfants': 'nombreEnfants',

  // Conjoint fields
  'date de naissance conjoint': 'conjointDateNaissance',
  'regime social conjoint': 'conjointRegimeSocial',
  'profession conjoint': 'conjointProfession',

  // Children fields (min/max dates)
  'date de naissance enfants min': 'enfantsDateMin',
  'date de naissance enfants max': 'enfantsDateMax',

  // Besoin fields
  'besoin assurance sante': 'besoinMotif',
  'mois d\'echeance': 'moisEcheance',
  'assureur actuel': 'assureurActuel',
  'formule choisie': 'formuleChoisie',

  // Internal ID
  'user_id': 'userId',
};
