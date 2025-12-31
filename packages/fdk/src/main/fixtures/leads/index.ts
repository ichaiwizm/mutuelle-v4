/**
 * Test Leads Index
 * Re-exports all test lead fixtures
 */
import type { LeadType } from "../../db/lead-repository";
import type { TestLead } from "./types";
import { leadSolo } from "./lead-solo";
import { leadFamille } from "./lead-famille";
import { leadConjoint } from "./lead-conjoint";
import { leadEnfants } from "./lead-enfants";

export type { TestLead };
export { leadSolo, leadFamille, leadConjoint, leadEnfants };

export const testLeads: TestLead[] = [leadSolo, leadFamille, leadConjoint, leadEnfants];

export function getAllTestLeads(): TestLead[] {
  return testLeads;
}

export function getTestLeadById(id: string): TestLead | null {
  return testLeads.find((lead) => lead.id === id) || null;
}

export function getTestLeadsByType(type: LeadType): TestLead[] {
  return testLeads.filter((lead) => lead.type === type);
}
