/**
 * Lead Conjoint - Couple sans enfants
 */
import type { TestLead } from "./types";
import { now } from "./types";

export const leadConjoint: TestLead = {
  id: "test-lead-conjoint-001",
  name: "Sophie Leroy",
  type: "conjoint",
  createdAt: now,
  updatedAt: now,
  data: {
    civility: "Mme",
    firstName: "Sophie",
    lastName: "Leroy",
    birthDate: "1990-01-30",
    birthName: "Petit",
    email: "sophie.leroy@example.com",
    phone: "0654321098",
    mobilePhone: "0654321098",
    address: "8 Rue du Commerce",
    addressComplement: "Batiment C",
    postalCode: "33000",
    city: "Bordeaux",
    country: "France",
    profession: "Commerciale",
    professionCode: "46",
    csp: "Employe",
    regime: "general",
    regimeCode: "01",
    socialSecurityNumber: "290013312345654",
    bank: { iban: "FR7620041010051234567890154", bic: "PSSTFRPP" },
    conjoint: {
      civility: "M",
      firstName: "Thomas",
      lastName: "Leroy",
      birthDate: "1988-06-12",
      birthName: "Leroy",
      socialSecurityNumber: "188063312345621",
      regime: "general",
      regimeCode: "01",
      profession: "Artisan",
      professionCode: "21",
    },
    effectiveDate: "2025-03-01",
    paymentFrequency: "quarterly",
    paymentMethod: "prelevement",
  },
};
