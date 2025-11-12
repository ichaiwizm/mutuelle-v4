import { describe, it, expect } from 'vitest';
import { decodeBase64UrlSafe } from '@/main/mail/google/encoding';

describe('decodeBase64UrlSafe', () => {
  it('decodes standard base64 text', () => {
    const encoded = 'SGVsbG8gV29ybGQh'; // "Hello World!"
    const decoded = decodeBase64UrlSafe(encoded);
    expect(decoded).toBe('Hello World!');
  });

  it('decodes URL-safe base64 with hyphens and underscores', () => {
    // Gmail uses - instead of + and _ instead of /
    const encoded = 'VGVzdCB3aXRoIHNwZWNpYWwgY2hhcnM_IQ'; // Uses _
    const decoded = decodeBase64UrlSafe(encoded);
    expect(decoded).toContain('Test with special chars');
  });

  it('handles empty string', () => {
    expect(decodeBase64UrlSafe('')).toBe('');
  });

  it('decodes UTF-8 characters correctly', () => {
    // "Bonjour! Ça va?" in base64 URL-safe
    const encoded = 'Qm9uam91ciEgw4dhIHZhPw';
    const decoded = decodeBase64UrlSafe(encoded);
    expect(decoded).toBe('Bonjour! Ça va?');
  });

  it('decodes multiline text', () => {
    const encoded = 'TGluZSAxCkxpbmUgMgpMaW5lIDM'; // "Line 1\nLine 2\nLine 3"
    const decoded = decodeBase64UrlSafe(encoded);
    expect(decoded).toBe('Line 1\nLine 2\nLine 3');
  });

  it('decodes Gmail email body format', () => {
    // Simulates a typical Gmail API response body
    const encoded = 'Qm9uam91ciwKCk5vdXZlbGxlIGRlbWFuZGUgZGUgZGV2aXMu';
    const decoded = decodeBase64UrlSafe(encoded);
    expect(decoded).toContain('Bonjour');
    expect(decoded).toContain('Nouvelle demande de devis');
  });
});
