/**
 * Lead Famille - Famille complete avec conjoint et enfants
 */
import type { TestLead } from "./types";
import { now } from "./types";

export const leadFamille: TestLead = {
  id: "test-lead-famille-001",
  name: "Marie Martin",
  type: "famille",
  createdAt: now,
  updatedAt: now,
  data: {
    civility: "Mme",
    firstName: "Marie",
    lastName: "Martin",
    birthDate: "1982-07-22",
    birthName: "Bernard",
    email: "marie.martin@example.com",
    phone: "0698765432",
    mobilePhone: "0698765432",
    address: "45 Avenue des Champs",
    addressComplement: "",
    postalCode: "69003",
    city: "Lyon",
    country: "France",
    profession: "Enseignante",
    professionCode: "42",
    csp: "Profession intermediaire",
    regime: "general",
    regimeCode: "01",
    socialSecurityNumber: "282077512345632",
    bank: { iban: "FR7630004000031234567890143", bic: "BNPAFRPP" },
    conjoint: {
      civility: "M",
      firstName: "Pierre",
      lastName: "Martin",
      birthDate: "1980-11-08",
      birthName: "Martin",
      socialSecurityNumber: "180117512345698",
      regime: "general",
      regimeCode: "01",
      profession: "Ingenieur",
      professionCode: "38",
    },
    enfants: [
      {
        civility: "M", firstName: "Lucas", lastName: "Martin", birthDate: "2012-05-14",
        socialSecurityNumber: "", regime: "general", regimeCode: "01", rattachement: "assure",
      },
      {
        civility: "Mme", firstName: "Emma", lastName: "Martin", birthDate: "2015-09-23",
        socialSecurityNumber: "", regime: "general", regimeCode: "01", rattachement: "assure",
      },
    ],
    effectiveDate: "2025-02-01",
    paymentFrequency: "monthly",
    paymentMethod: "prelevement",
  },
};
