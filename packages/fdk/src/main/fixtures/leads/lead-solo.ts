/**
 * Lead Solo - Personne seule sans conjoint ni enfants
 */
import type { TestLead } from "./types";
import { now } from "./types";

export const leadSolo: TestLead = {
  id: "test-lead-solo-001",
  name: "Jean Dupont",
  type: "solo",
  createdAt: now,
  updatedAt: now,
  data: {
    civility: "M",
    firstName: "Jean",
    lastName: "Dupont",
    birthDate: "1985-03-15",
    birthName: "Dupont",
    email: "jean.dupont@example.com",
    phone: "0612345678",
    mobilePhone: "0612345678",
    address: "12 Rue de la Paix",
    addressComplement: "Appartement 4B",
    postalCode: "75002",
    city: "Paris",
    country: "France",
    profession: "Cadre",
    professionCode: "34",
    csp: "Cadre du secteur prive",
    regime: "general",
    regimeCode: "01",
    socialSecurityNumber: "185037512345678",
    bank: { iban: "FR7630001007941234567890185", bic: "BDFEFRPP" },
    effectiveDate: "2025-02-01",
    paymentFrequency: "monthly",
    paymentMethod: "prelevement",
  },
};
