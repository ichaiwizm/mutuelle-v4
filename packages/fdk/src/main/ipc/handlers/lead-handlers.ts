/**
 * Lead IPC Handlers
 * Handles lead listing and retrieval from the main app's database
 */
import type { IpcMainInvokeEvent } from "electron";
import { getAll, getById, getByType, type Lead, type LeadType, type LeadFilters } from "../../db/lead-repository";

export type { Lead, LeadType };

export interface ListLeadsOptions {
  type?: LeadType;
  limit?: number;
  search?: string;
}

/**
 * List leads from the database
 */
export async function handleLeadList(
  _event: IpcMainInvokeEvent,
  options?: ListLeadsOptions
): Promise<Lead[]> {
  try {
    const filters: LeadFilters = {
      type: options?.type,
      limit: options?.limit,
      search: options?.search,
    };
    const leads = getAll(filters);
    console.log(`[lead-handlers] Returning ${leads.length} leads from database`);
    return leads;
  } catch (error) {
    console.error("[lead-handlers] Error listing leads:", error);
    return [];
  }
}

/**
 * Get a specific lead by ID
 */
export async function handleLeadGet(
  _event: IpcMainInvokeEvent,
  leadId: string
): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  try {
    const lead = getById(leadId);
    if (!lead) {
      return { success: false, error: `Lead not found: ${leadId}` };
    }
    console.log(`[lead-handlers] Returning lead: ${lead.name}`);
    return { success: true, lead };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[lead-handlers] Error getting lead:", error);
    return { success: false, error: message };
  }
}

/**
 * Get leads by type
 */
export async function handleLeadsByType(
  _event: IpcMainInvokeEvent,
  type: LeadType
): Promise<Lead[]> {
  try {
    const leads = getByType(type);
    console.log(`[lead-handlers] Returning ${leads.length} leads of type "${type}"`);
    return leads;
  } catch (error) {
    console.error("[lead-handlers] Error getting leads by type:", error);
    return [];
  }
}
