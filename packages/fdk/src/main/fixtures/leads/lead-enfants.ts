/**
 * Lead Enfants - Parent seul avec enfants
 */
import type { TestLead } from "./types";
import { now } from "./types";

export const leadEnfants: TestLead = {
  id: "test-lead-enfants-001",
  name: "Claire Moreau",
  type: "enfants",
  createdAt: now,
  updatedAt: now,
  data: {
    civility: "Mme",
    firstName: "Claire",
    lastName: "Moreau",
    birthDate: "1978-12-05",
    birthName: "Dubois",
    email: "claire.moreau@example.com",
    phone: "0687654321",
    mobilePhone: "0687654321",
    address: "22 Boulevard Victor Hugo",
    addressComplement: "",
    postalCode: "44000",
    city: "Nantes",
    country: "France",
    profession: "Infirmiere",
    professionCode: "43",
    csp: "Profession intermediaire",
    regime: "general",
    regimeCode: "01",
    socialSecurityNumber: "278124412345687",
    bank: { iban: "FR7610096000201234567890182", bic: "CMCIFRPP" },
    enfants: [
      {
        civility: "M", firstName: "Hugo", lastName: "Moreau", birthDate: "2008-03-18",
        socialSecurityNumber: "", regime: "general", regimeCode: "01", rattachement: "assure",
      },
      {
        civility: "Mme", firstName: "Lea", lastName: "Moreau", birthDate: "2010-08-07",
        socialSecurityNumber: "", regime: "general", regimeCode: "01", rattachement: "assure",
      },
      {
        civility: "M", firstName: "Nathan", lastName: "Moreau", birthDate: "2016-02-28",
        socialSecurityNumber: "", regime: "general", regimeCode: "01", rattachement: "assure",
      },
    ],
    effectiveDate: "2025-01-15",
    paymentFrequency: "monthly",
    paymentMethod: "carte",
  },
};
