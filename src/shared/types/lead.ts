/**
 * Subscriber data - personal information of the main subscriber
 */
export type Subscriber = {
  civilite?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  profession?: string;
  regimeSocial?: string;
  codePostal?: string;
  ville?: string;
  adresse?: string;
  email?: string;
  telephone?: string;
  nombreEnfants?: number;
  [key: string]: unknown; // Allow additional fields
};

/**
 * Conjoint data - spouse information
 */
export type Conjoint = {
  dateNaissance?: string;
  profession?: string;
  regimeSocial?: string;
  [key: string]: unknown;
};

/**
 * Project data - insurance project details
 */
export type Project = {
  dateEffet?: string;
  moisEcheance?: string;
  assureurActuel?: string;
  formuleChoisie?: string;
  besoinAssuranceSante?: string;
  emailId?: string;
  conjoint?: Conjoint;
  [key: string]: unknown;
};

/**
 * Child data
 */
export type Child = {
  dateNaissance?: string;
  regimeSocial?: string;
  [key: string]: unknown;
};

/**
 * Lead - normalized lead data from various providers
 */
export type Lead = {
  id: string;
  subscriber: Subscriber;
  project?: Project;
  children?: Child[];
};
