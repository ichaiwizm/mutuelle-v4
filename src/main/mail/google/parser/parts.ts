import type { gmail_v1 } from 'googleapis';

export function findTextPlainPart(payload: gmail_v1.Schema$MessagePart | undefined): gmail_v1.Schema$MessagePart | undefined {
  if (!payload) return undefined;

  if (payload.mimeType === 'text/plain' && payload.body?.data) return payload;

  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      const found = findTextPlainPart(part);
      if (found?.mimeType === 'text/plain') return found;
    }
    for (const part of payload.parts) {
      const found = findAnyTextPart(part);
      if (found) return found;
    }
  }

  if (payload.body?.data) return payload;
  return undefined;
}

function findAnyTextPart(payload: gmail_v1.Schema$MessagePart | undefined): gmail_v1.Schema$MessagePart | undefined {
  if (!payload) return undefined;
  if (payload.body?.data && payload.mimeType?.startsWith('text/')) return payload;
  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      const found = findAnyTextPart(part);
      if (found) return found;
    }
  }
  return undefined;
}
