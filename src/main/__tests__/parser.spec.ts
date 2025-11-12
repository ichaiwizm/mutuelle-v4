/* eslint-disable max-lines */
import { describe, it, expect } from 'vitest';
import { parseHeaders, findTextPlainPart, parseGmailMessage } from '@/main/mail/google/parser';
import type { gmail_v1 } from 'googleapis';

describe('parseHeaders', () => {
  it('parses headers array into object with lowercase keys', () => {
    const headers: gmail_v1.Schema$MessagePartHeader[] = [
      { name: 'Subject', value: 'Test Subject' },
      { name: 'From', value: 'test@example.com' },
      { name: 'Date', value: 'Mon, 1 Jan 2024 12:00:00 GMT' },
    ];

    const result = parseHeaders(headers);

    expect(result).toEqual({
      subject: 'Test Subject',
      from: 'test@example.com',
      date: 'Mon, 1 Jan 2024 12:00:00 GMT',
    });
  });

  it('handles missing header value', () => {
    const headers: gmail_v1.Schema$MessagePartHeader[] = [
      { name: 'Subject' }, // No value
    ];

    const result = parseHeaders(headers);

    expect(result).toEqual({
      subject: '',
    });
  });

  it('returns empty object for undefined headers', () => {
    const result = parseHeaders(undefined);
    expect(result).toEqual({});
  });

  it('normalizes header names to lowercase', () => {
    const headers: gmail_v1.Schema$MessagePartHeader[] = [
      { name: 'Content-Type', value: 'text/plain' },
      { name: 'CONTENT-LENGTH', value: '1234' },
    ];

    const result = parseHeaders(headers);

    expect(result['content-type']).toBe('text/plain');
    expect(result['content-length']).toBe('1234');
  });
});

describe('findTextPlainPart', () => {
  it('finds text/plain part in multipart message', () => {
    const payload: gmail_v1.Schema$MessagePart = {
      parts: [
        { mimeType: 'text/html', body: { data: 'html_data' } },
        { mimeType: 'text/plain', body: { data: 'plain_text_data' } },
      ],
    };

    const result = findTextPlainPart(payload);

    expect(result?.mimeType).toBe('text/plain');
    expect(result?.body?.data).toBe('plain_text_data');
  });

  it('returns payload itself if no parts', () => {
    const payload: gmail_v1.Schema$MessagePart = {
      mimeType: 'text/plain',
      body: { data: 'single_part_data' },
    };

    const result = findTextPlainPart(payload);

    expect(result).toBe(payload);
  });

  it('returns undefined for undefined payload', () => {
    const result = findTextPlainPart(undefined);
    expect(result).toBeUndefined();
  });

  it('prefers text/plain over text/html', () => {
    const payload: gmail_v1.Schema$MessagePart = {
      parts: [
        { mimeType: 'text/html', body: { data: 'html_data' } },
        { mimeType: 'text/plain', body: { data: 'plain_text_data' } },
        { mimeType: 'application/pdf', body: { data: 'pdf_data' } },
      ],
    };

    const result = findTextPlainPart(payload);

    expect(result?.mimeType).toBe('text/plain');
  });
});

describe('parseGmailMessage', () => {
  it('parses complete Gmail message', () => {
    const message: gmail_v1.Schema$Message = {
      id: 'msg123',
      internalDate: '1704110400000', // 2024-01-01 12:00:00 GMT
      payload: {
        headers: [
          { name: 'Subject', value: 'Test Email' },
          { name: 'From', value: 'sender@example.com' },
        ],
        parts: [
          {
            mimeType: 'text/plain',
            body: { data: 'SGVsbG8gV29ybGQh' }, // "Hello World!" in base64
          },
        ],
      },
    };

    const result = parseGmailMessage(message);

    expect(result.id).toBe('msg123');
    expect(result.subject).toBe('Test Email');
    expect(result.from).toBe('sender@example.com');
    expect(result.date).toBe(1704110400000);
    expect(result.text).toBe('Hello World!');
  });

  it('handles missing headers', () => {
    const message: gmail_v1.Schema$Message = {
      id: 'msg456',
      payload: {
        body: { data: '' },
      },
    };

    const result = parseGmailMessage(message);

    expect(result.id).toBe('msg456');
    expect(result.subject).toBe('');
    expect(result.from).toBe('');
    expect(result.text).toBe('');
  });

  it('uses current time if internalDate missing', () => {
    const now = Date.now();
    const message: gmail_v1.Schema$Message = {
      id: 'msg789',
      payload: {
        body: { data: '' },
      },
    };

    const result = parseGmailMessage(message);

    expect(result.date).toBeGreaterThanOrEqual(now);
    expect(result.date).toBeLessThanOrEqual(Date.now());
  });

  it('handles single-part message (no parts array)', () => {
    const message: gmail_v1.Schema$Message = {
      id: 'msg_single',
      payload: {
        mimeType: 'text/plain',
        headers: [
          { name: 'Subject', value: 'Single Part' },
          { name: 'From', value: 'user@example.com' },
        ],
        body: { data: 'U2luZ2xlIHBhcnQgdGV4dA' }, // "Single part text"
      },
    };

    const result = parseGmailMessage(message);

    expect(result.subject).toBe('Single Part');
    expect(result.from).toBe('user@example.com');
    expect(result.text).toBe('Single part text');
  });

  it('decodes URL-safe base64 in body', () => {
    const message: gmail_v1.Schema$Message = {
      id: 'msg_urlsafe',
      payload: {
        headers: [
          { name: 'Subject', value: 'URL Safe Test' },
          { name: 'From', value: 'test@gmail.com' },
        ],
        body: {
          // Contains URL-safe characters (- and _)
          data: 'VGVzdCB3aXRoIHNwZWNpYWwgY2hhcnM_IQ',
        },
      },
    };

    const result = parseGmailMessage(message);

    expect(result.text).toContain('Test with special chars');
  });
});
