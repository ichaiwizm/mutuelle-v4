import type { Lead } from '@/shared/types/lead'

export type { Lead } from '@/shared/types/lead'

/**
 * LeadRow as returned by the API (after IPC serialization)
 * - `data` is a JSON string containing the Lead object
 * - Dates are ISO strings (serialized over IPC)
 */
export interface LeadRow {
  id: string
  data: string // JSON string, must be parsed
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

/**
 * API response from window.api.leads.list()
 */
export interface LeadsListResponse {
  leads: LeadRow[]
  total: number
}

/**
 * Lead with parsed metadata for frontend use
 */
export interface LeadWithMeta extends Lead {
  createdAt: Date
  updatedAt: Date
}

/**
 * Parse a LeadRow (from API) into LeadWithMeta (for frontend)
 */
export function parseLeadRow(row: LeadRow): LeadWithMeta {
  // Parse the JSON string into a Lead object
  const lead = JSON.parse(row.data) as Lead

  return {
    ...lead,
    // Convert ISO strings to Date objects
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}
