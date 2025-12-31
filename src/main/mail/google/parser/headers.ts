import type { gmail_v1 } from 'googleapis';

export function parseHeaders(headers: gmail_v1.Schema$MessagePartHeader[] | undefined): Record<string, string> {
  if (!headers) return {};
  return Object.fromEntries(headers.map(h => [String(h.name).toLowerCase(), String(h.value || '')]));
}
