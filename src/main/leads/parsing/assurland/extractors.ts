import { FIELD_MAPPINGS } from './fieldMappings';
import { cleanValue } from './utils';

/**
 * Extract field-value pairs from tab-separated text
 * Format: Field\tValue (one per line)
 */
export function extractTextFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = text.split('\n');

  for (const line of lines) {
    // Split by tab
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const rawField = parts[0].trim().toLowerCase();
      const rawValue = parts.slice(1).join('\t').trim();

      // Map field name to internal name
      const fieldName = FIELD_MAPPINGS[rawField] || rawField;

      if (rawValue && rawValue !== 'NON RENSEIGNE') {
        fields[fieldName] = rawValue;
      }
    }
  }

  return fields;
}

/**
 * Extract field-value pairs from HTML table rows
 * Handles format: <tr><td><b>Field</b></td><td>Value</td></tr>
 */
export function extractHtmlTableFields(html: string): Record<string, string> {
  const fields: Record<string, string> = {};

  // Pattern to match table rows with field-value pairs
  // Handles both <b>Field</b> and plain Field formats
  const rowPattern = /<tr[^>]*>\s*<td[^>]*>(?:<b>)?([^<]+)(?:<\/b>)?<\/td>\s*<td[^>]*>([^<]*?)(?:&nbsp;)*<\/td>\s*<\/tr>/gi;

  let match;
  while ((match = rowPattern.exec(html)) !== null) {
    const rawField = match[1].trim().toLowerCase();
    const rawValue = cleanValue(match[2]);

    // Map field name to internal name
    const fieldName = FIELD_MAPPINGS[rawField] || rawField;

    if (rawValue && rawValue !== 'NON RENSEIGNE') {
      fields[fieldName] = rawValue;
    }
  }

  return fields;
}
