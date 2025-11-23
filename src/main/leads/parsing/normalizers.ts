/**
 * Text normalization utilities for lead parsing
 */

export interface NormalizeOptions {
  /**
   * Remove email quote markers (> at start of lines)
   * Default: false
   */
  removeEmailQuotes?: boolean;

  /**
   * Normalize line endings to LF (\n)
   * Default: true
   */
  normalizeLineEndings?: boolean;
}

/**
 * Normalizes text for parsing
 * Handles line endings, email quotes, and other formatting issues
 */
export function normalizeText(text: string, options: NormalizeOptions = {}): string {
  const {
    removeEmailQuotes = false,
    normalizeLineEndings = true,
  } = options;

  let normalized = text;

  // Normalize line endings (CRLF → LF)
  if (normalizeLineEndings) {
    normalized = normalized.replace(/\r\n/g, '\n');
  }

  // Remove email quote markers (> at start of lines)
  if (removeEmailQuotes) {
    normalized = normalized.replace(/^>\s?/gm, '');
  }

  return normalized;
}
