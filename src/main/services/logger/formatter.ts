import type { LogContext } from './types';

const KNOWN_KEYS = ['service', 'flowKey', 'leadId', 'runId', 'runItemId'];

export function formatContext(context?: LogContext): string {
  if (!context) return "";
  const parts: string[] = [];
  if (context.service) parts.push(`[${context.service}]`);
  if (context.flowKey) parts.push(`flow=${context.flowKey}`);
  if (context.leadId) parts.push(`lead=${context.leadId}`);
  if (context.runId) parts.push(`run=${context.runId}`);
  if (context.runItemId) parts.push(`item=${context.runItemId}`);

  const extraKeys = Object.keys(context).filter((k) => !KNOWN_KEYS.includes(k));
  for (const key of extraKeys) {
    const value = context[key];
    if (value !== undefined && value !== null) {
      parts.push(`${key}=${JSON.stringify(value)}`);
    }
  }

  return parts.join(" ");
}
