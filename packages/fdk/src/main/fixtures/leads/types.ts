/**
 * Test Lead Types
 */
import type { Lead, LeadType } from "../../db/lead-repository";

export interface TestLead extends Lead {
  id: string;
  name: string;
  type: LeadType;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export const now = new Date();
