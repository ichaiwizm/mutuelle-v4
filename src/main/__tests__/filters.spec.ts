import { describe, it, expect } from 'vitest';
import { matchesProvider } from '@/main/mail/filters';
import type { Provider } from '@/main/mail/providers';

describe('matchesProvider', () => {
  const providers: Provider[] = [
    { email: 'noreply@assurland.com' },
    { domain: 'assurprospect.com' },
    { email: 'leads@example.com', domain: 'example.com' }, // Les deux
  ];

  it('matches exact email address', () => {
    expect(matchesProvider('noreply@assurland.com', providers)).toBe(true);
    expect(matchesProvider('NoReply@Assurland.COM', providers)).toBe(true); // Case insensitive
  });

  it('matches email with sender name', () => {
    expect(matchesProvider('Assurland <noreply@assurland.com>', providers)).toBe(true);
    expect(matchesProvider('"John Doe" <noreply@assurland.com>', providers)).toBe(true);
  });

  it('matches domain', () => {
    expect(matchesProvider('contact@assurprospect.com', providers)).toBe(true);
    expect(matchesProvider('anything@assurprospect.com', providers)).toBe(true);
    expect(matchesProvider('Contact <info@assurprospect.com>', providers)).toBe(true);
  });

  it('does not match different email', () => {
    expect(matchesProvider('other@gmail.com', providers)).toBe(false);
    expect(matchesProvider('John Doe <john@unknown.com>', providers)).toBe(false);
  });

  it('does not match different domain', () => {
    expect(matchesProvider('contact@notinlist.com', providers)).toBe(false);
  });

  it('handles malformed input', () => {
    expect(matchesProvider('', providers)).toBe(false);
    expect(matchesProvider('no-at-sign', providers)).toBe(false);
    expect(matchesProvider('invalid email format', providers)).toBe(false);
  });

  it('matches either email or domain when both are specified', () => {
    expect(matchesProvider('leads@example.com', providers)).toBe(true); // Match par email
    expect(matchesProvider('other@example.com', providers)).toBe(true); // Match par domaine
  });
});
