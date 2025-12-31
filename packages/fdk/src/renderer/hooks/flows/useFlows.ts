/**
 * useFlows hook
 * Manages flow listing, loading, and selection
 */
import { useState, useEffect, useCallback } from 'react';
import { type FlowSource, type UseFlowsState, type FlowInfo } from './types';
import { mapFlowInfo, mapFlowsArray } from './mapFlowInfo';

export function useFlows() {
  const [state, setState] = useState<UseFlowsState>({
    flows: [],
    selectedFlow: null,
    loading: true,
    error: null,
    sourceFilter: 'all',
  });

  const listFlows = useCallback(async (source?: FlowSource) => {
    const filterSource = source ?? state.sourceFilter;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      if (!window.electron?.flow?.list) {
        throw new Error('window.electron.flow.list is not available');
      }
      const flows = await window.electron.flow.list({ source: filterSource });
      setState((s) => ({ ...s, flows: mapFlowsArray(flows), loading: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to list flows',
        loading: false,
      }));
    }
  }, [state.sourceFilter]);

  const setSourceFilter = useCallback((source: FlowSource) => {
    setState((s) => ({ ...s, sourceFilter: source }));
  }, []);

  const loadFlow = useCallback(async (flowKey: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await window.electron.flow.load(flowKey);
      if (result.success && result.flow) {
        const flow = result.flow;
        setState((s) => ({ ...s, selectedFlow: mapFlowInfo(flow), loading: false }));
      } else {
        setState((s) => ({ ...s, error: result.error ?? 'Failed to load flow', loading: false }));
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Failed to load flow',
        loading: false,
      }));
    }
  }, []);

  const clearSelection = useCallback(() => {
    setState((s) => ({ ...s, selectedFlow: null }));
  }, []);

  const refreshFlows = useCallback(() => {
    return listFlows(state.sourceFilter);
  }, [listFlows, state.sourceFilter]);

  useEffect(() => {
    listFlows(state.sourceFilter);
  }, [state.sourceFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    flows: state.flows,
    selectedFlow: state.selectedFlow,
    loading: state.loading,
    error: state.error,
    sourceFilter: state.sourceFilter,
    setSourceFilter,
    listFlows,
    loadFlow,
    clearSelection,
    refreshFlows,
  };
}
