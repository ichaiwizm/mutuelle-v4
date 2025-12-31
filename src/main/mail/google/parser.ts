import type { gmail_v1 } from 'googleapis';
import { decodeBase64UrlSafe } from './encoding';
import type { MailMsg } from './client';
import { parseHeaders } from './parser/headers';
import { findTextPlainPart } from './parser/parts';

export { parseHeaders, findTextPlainPart };

export function parseGmailMessage(response: gmail_v1.Schema$Message): MailMsg {
  const id = response.id || '';
  const payload = response.payload;

  const headers = parseHeaders(payload?.headers);
  const subject = headers['subject'] || '';
  const from = headers['from'] || '';

  const date = Number(response.internalDate || Date.now());

  const bodyPart = findTextPlainPart(payload);
  const encodedData = bodyPart?.body?.data || '';
  const text = decodeBase64UrlSafe(encodedData);

  return { id, subject, from, date, text };
}
