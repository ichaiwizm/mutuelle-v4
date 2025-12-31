import { useState, useEffect, useCallback } from 'react';

export type LeadType = 'solo' | 'conjoint' | 'enfants' | 'famille';

export interface Lead {
  id: string;
  name: string;
  type: LeadType;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ListLeadsOptions {
  type?: LeadType;
  limit?: number;
}

interface UseLeadsState {
  leads: Lead[];
  selectedLead: Lead | null;
  loading: boolean;
  error: string | null;
}

export function useLeads(options?: ListLeadsOptions) {
  const [state, setState] = useState<UseLeadsState>({
    leads: [],
    selectedLead: null,
    loading: true,
    error: null,
  });

  const listLeads = useCallback(async (opts?: ListLeadsOptions) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      console.log('[useLeads] Calling window.electron.lead.list()');
      console.log('[useLeads] window.electron:', window.electron);
      if (!window.electron?.lead?.list) {
        throw new Error('window.electron.lead.list is not available');
      }
      const leads = await window.electron.lead.list(opts);
      console.log('[useLeads] Received leads:', leads);
      setState((s) => ({ ...s, leads, loading: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to list leads',
        loading: false,
      }));
    }
  }, []);

  const getLead = useCallback(async (leadId: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await window.electron.lead.get(leadId);
      if (result.success && result.lead) {
        setState((s) => ({ ...s, selectedLead: result.lead!, loading: false }));
        return result.lead;
      }
      setState((s) => ({ ...s, error: result.error ?? 'Failed to get lead', loading: false }));
      return null;
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to get lead',
        loading: false,
      }));
      return null;
    }
  }, []);

  const selectLead = useCallback((lead: Lead | null) => {
    setState((s) => ({ ...s, selectedLead: lead }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((s) => ({ ...s, selectedLead: null }));
  }, []);

  useEffect(() => {
    listLeads(options);
  }, [listLeads, options]);

  return {
    leads: state.leads,
    selectedLead: state.selectedLead,
    loading: state.loading,
    error: state.error,
    listLeads,
    getLead,
    selectLead,
    clearSelection,
  };
}
