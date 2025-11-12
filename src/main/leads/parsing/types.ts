/**
 * Types for lead parsing
 */

export type ExtractedContact = {
  civilite?: string;
  nom?: string;
  prenom?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  telephone?: string;
  email?: string;
};

export type ExtractedPerson = {
  dateNaissance?: string;
  profession?: string;
  regimeSocial?: string;
  nombreEnfants?: number;
};

export type ExtractedChild = {
  dateNaissance: string;
  order?: number;
};

export type ExtractedBesoin = {
  dateEffet?: string;
  actuellementAssure?: boolean;
  soinsMedicaux?: number;
  hospitalisation?: number;
  optique?: number;
  dentaire?: number;
};

export type ExtractedLead = {
  contact?: ExtractedContact;
  souscripteur?: ExtractedPerson;
  conjoint?: ExtractedPerson;
  enfants?: ExtractedChild[];
  besoin?: ExtractedBesoin;
};

export type ParseResult = {
  success: boolean;
  data?: ExtractedLead;
  errors?: string[];
  warnings?: string[];
};

export type SectionMap = {
  contact?: string;
  souscripteur?: string;
  conjoint?: string;
  enfants?: string;
  besoin?: string;
};
