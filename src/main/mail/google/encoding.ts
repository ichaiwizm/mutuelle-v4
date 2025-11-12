/**
 * Gmail API encoding utilities
 *
 * Gmail uses URL-safe base64 encoding (RFC 4648) for message bodies.
 * This module provides utilities to decode these encodings.
 */

/**
 * Decodes a Gmail base64 URL-safe encoded string to UTF-8 text
 *
 * Gmail encodes message bodies using base64 URL-safe encoding where:
 * - '-' (minus) is used instead of '+' (plus)
 * - '_' (underscore) is used instead of '/' (slash)
 * - No padding '=' is used
 *
 * @param data - The base64 URL-safe encoded string from Gmail API
 * @returns The decoded UTF-8 text, or empty string if input is empty
 *
 * @example
 * ```typescript
 * const encoded = "SGVsbG8gV29ybGQh"; // Hello World!
 * const decoded = decodeBase64UrlSafe(encoded);
 * console.log(decoded); // "Hello World!"
 * ```
 */
export function decodeBase64UrlSafe(data: string): string {
  if (!data) return '';

  // Convert URL-safe base64 to standard base64
  // Replace Gmail's URL-safe characters with standard base64 characters
  const standardBase64 = data
    .replace(/-/g, '+')  // Restore plus signs
    .replace(/_/g, '/'); // Restore slashes

  // Decode from base64 to Buffer, then convert to UTF-8 string
  return Buffer.from(standardBase64, 'base64').toString('utf8');
}
