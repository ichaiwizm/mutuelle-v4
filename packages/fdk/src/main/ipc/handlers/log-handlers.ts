/**
 * Log IPC Handlers
 * Handles log subscription and emission to renderer
 */
import type { IpcMainInvokeEvent, WebContents } from 'electron';
import { LOG_CHANNELS } from '../channels';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  stepId?: string;
  data?: Record<string, unknown>;
}

// Active subscribers (renderer webContents)
const subscribers = new Set<WebContents>();

/** Subscribe to execution logs */
export async function handleLogSubscribe(event: IpcMainInvokeEvent): Promise<{ success: boolean }> {
  subscribers.add(event.sender);

  // Clean up when the window is closed
  event.sender.once('destroyed', () => {
    subscribers.delete(event.sender);
  });

  return { success: true };
}

/** Unsubscribe from execution logs */
export async function handleLogUnsubscribe(event: IpcMainInvokeEvent): Promise<{ success: boolean }> {
  subscribers.delete(event.sender);
  return { success: true };
}

/** Emit a log entry to all subscribers */
export function emitLog(entry: LogEntry): void {
  const payload = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  for (const subscriber of subscribers) {
    if (!subscriber.isDestroyed()) {
      subscriber.send(LOG_CHANNELS.EVENT, payload);
    }
  }
}

/** Create a logger instance for a specific execution */
export function createExecutionLogger(executionId: string) {
  return {
    debug: (message: string, data?: Record<string, unknown>) =>
      emitLog({ timestamp: new Date().toISOString(), level: 'debug', message, data: { ...data, executionId } }),
    info: (message: string, data?: Record<string, unknown>) =>
      emitLog({ timestamp: new Date().toISOString(), level: 'info', message, data: { ...data, executionId } }),
    warn: (message: string, data?: Record<string, unknown>) =>
      emitLog({ timestamp: new Date().toISOString(), level: 'warn', message, data: { ...data, executionId } }),
    error: (message: string, data?: Record<string, unknown>) =>
      emitLog({ timestamp: new Date().toISOString(), level: 'error', message, data: { ...data, executionId } }),
    step: (stepId: string, message: string, level: LogLevel = 'info') =>
      emitLog({ timestamp: new Date().toISOString(), level, message, stepId, data: { executionId } }),
  };
}
