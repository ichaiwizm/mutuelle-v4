import { useState, useEffect, useCallback, useRef } from 'react';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogEntry { id: string; timestamp: Date; level: LogLevel; message: string; stepId?: string; }
interface RunFlowParams { flowKey: string; lead: Record<string, unknown>; credentials?: { username: string; password: string }; }
interface State { isRunning: boolean; logs: LogEntry[]; executionId: string | null; error: string | null; }

export function useFlowRunner() {
  const [state, setState] = useState<State>({ isRunning: false, logs: [], executionId: null, error: null });
  const unsubRef = useRef<(() => void) | null>(null);

  const addLog = useCallback((level: LogLevel, message: string, stepId?: string) => {
    setState((s) => ({
      ...s,
      logs: [...s.logs, { id: crypto.randomUUID(), timestamp: new Date(), level, message, stepId }],
    }));
  }, []);

  const subscribe = useCallback(async () => {
    await window.electron.log.subscribe();
    unsubRef.current = window.electron.log.onEvent((entry) => {
      setState((s) => ({
        ...s,
        logs: [...s.logs, {
          id: crypto.randomUUID(),
          timestamp: new Date(entry.timestamp),
          level: entry.level === 'debug' ? 'info' : entry.level,
          message: entry.message,
          stepId: entry.stepId,
        }],
      }));
    });
  }, []);

  const unsubscribe = useCallback(async () => {
    unsubRef.current?.();
    unsubRef.current = null;
    await window.electron.log.unsubscribe();
  }, []);

  const run = useCallback(async (params: RunFlowParams) => {
    setState({ isRunning: true, logs: [], executionId: null, error: null });
    await subscribe();
    try {
      const result = await window.electron.flow.run(params);
      if (result.success && result.result) {
        setState((s) => ({ ...s, executionId: result.result!.executionId }));
      } else {
        setState((s) => ({ ...s, error: result.error ?? 'Flow execution failed' }));
      }
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Unknown error' }));
    } finally {
      setState((s) => ({ ...s, isRunning: false }));
      await unsubscribe();
    }
  }, [subscribe, unsubscribe]);

  const stop = useCallback(async () => {
    try {
      const result = await window.electron.flow.stop(state.executionId ?? undefined);
      if (!result.success) setState((s) => ({ ...s, error: result.error ?? 'Failed to stop flow' }));
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Unknown error' }));
    } finally {
      setState((s) => ({ ...s, isRunning: false }));
      await unsubscribe();
    }
  }, [state.executionId, unsubscribe]);

  const clearLogs = useCallback(() => setState((s) => ({ ...s, logs: [], error: null })), []);

  useEffect(() => () => { unsubRef.current?.(); }, []);

  return { isRunning: state.isRunning, logs: state.logs, executionId: state.executionId, error: state.error, run, stop, addLog, clearLogs };
}
