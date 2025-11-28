import { LEAD_FORM_SCHEMA } from "../leads/schema/lead-form-schema";
import type { LeadFormSchemaResult } from "@/shared/types/form-schema";

/**
 * Service for accessing the Lead form schema
 */
export const LeadFormSchemaService = {
  /**
   * Get the complete Lead form schema
   */
  getSchema(): LeadFormSchemaResult {
    return { schema: LEAD_FORM_SCHEMA };
  },

  /**
   * Get the schema version
   */
  getSchemaVersion(): string {
    return LEAD_FORM_SCHEMA.version;
  },
};
