/* eslint-disable max-lines */
/**
 * Gmail API message parsing utilities
 *
 * This module provides functions to parse Gmail API responses into structured data.
 */

import type { gmail_v1 } from 'googleapis';
import { decodeBase64UrlSafe } from './encoding';
import type { MailMsg } from './client';

/**
 * Parses Gmail message headers into a normalized key-value map
 *
 * Converts Gmail's header array format into a simple object with lowercase keys.
 *
 * @param headers - Array of Gmail message part headers
 * @returns Object mapping header names (lowercase) to their values
 *
 * @example
 * ```typescript
 * const headers = [
 *   { name: 'Subject', value: 'Hello' },
 *   { name: 'From', value: 'test@example.com' }
 * ];
 * const parsed = parseHeaders(headers);
 * // { subject: 'Hello', from: 'test@example.com' }
 * ```
 */
export function parseHeaders(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined
): Record<string, string> {
  if (!headers) return {};

  return Object.fromEntries(
    headers.map(h => [
      String(h.name).toLowerCase(),
      String(h.value || '')
    ])
  );
}

/**
 * Finds the text/plain MIME part in a Gmail message payload (recursively)
 *
 * Gmail messages can have multiple nested parts (HTML, plain text, attachments).
 * This function recursively searches for the plain text version, prioritizing
 * text/plain over text/html.
 *
 * @param payload - Gmail message payload
 * @returns The message part containing text/plain, or undefined if not found
 */
export function findTextPlainPart(
  payload: gmail_v1.Schema$MessagePart | undefined
): gmail_v1.Schema$MessagePart | undefined {
  if (!payload) return undefined;

  // If this part is text/plain with data, return it immediately
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return payload;
  }

  // Recursively search in parts - prioritize text/plain
  if (payload.parts && payload.parts.length > 0) {
    // First pass: look for text/plain specifically
    for (const part of payload.parts) {
      const found = findTextPlainPart(part);
      if (found?.mimeType === 'text/plain') return found;
    }

    // Second pass: accept any part with body data (e.g., text/html)
    for (const part of payload.parts) {
      const found = findAnyTextPart(part);
      if (found) return found;
    }
  }

  // Fallback: if payload itself has body data, return it
  if (payload.body?.data) {
    return payload;
  }

  return undefined;
}

/**
 * Helper: finds any text part with data (used as fallback when no text/plain exists)
 */
function findAnyTextPart(
  payload: gmail_v1.Schema$MessagePart | undefined
): gmail_v1.Schema$MessagePart | undefined {
  if (!payload) return undefined;

  // If this part has body data, return it
  if (payload.body?.data && payload.mimeType?.startsWith('text/')) {
    return payload;
  }

  // Recursively search in parts
  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      const found = findAnyTextPart(part);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Parses a complete Gmail API message response into a structured MailMsg object
 *
 * Extracts and normalizes all relevant fields from a Gmail API message:
 * - Message ID
 * - Subject and From headers
 * - Internal date (timestamp)
 * - Plain text body (decoded from base64)
 *
 * @param response - Full Gmail message response from API
 * @returns Structured MailMsg object
 *
 * @example
 * ```typescript
 * const response = await gmail.users.messages.get({
 *   userId: 'me',
 *   id: 'messageId',
 *   format: 'full'
 * });
 * const message = parseGmailMessage(response.data);
 * // { id: '...', subject: '...', from: '...', date: 123456, text: '...' }
 * ```
 */
export function parseGmailMessage(
  response: gmail_v1.Schema$Message
): MailMsg {
  const id = response.id || '';
  const payload = response.payload;

  // Parse headers
  const headers = parseHeaders(payload?.headers);
  const subject = headers['subject'] || '';
  const from = headers['from'] || '';

  // Parse date (Gmail internalDate is in milliseconds)
  const date = Number(response.internalDate || Date.now());

  // Extract text body
  const bodyPart = findTextPlainPart(payload);
  const encodedData = bodyPart?.body?.data || '';
  const text = decodeBase64UrlSafe(encodedData);

  return { id, subject, from, date, text };
}
