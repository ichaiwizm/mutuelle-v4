export interface ParsedLeadData {
  civilite?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  dateNaissance?: string;
  codePostal?: string;
  ville?: string;
  adresse?: string;
  regimeSocial?: string;
  profession?: string;
  dateEffet?: string;
  conjoint?: {
    civilite?: string;
    nom?: string;
    prenom?: string;
    dateNaissance?: string;
    regimeSocial?: string;
    profession?: string;
  } | null;
  enfants?: Array<{
    dateNaissance?: string;
    regimeSocial?: string;
  }>;
}
