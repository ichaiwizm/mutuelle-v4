import type { Detector, Mail, LeadCandidate } from './index';

function parseKeyValues(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z _-]{2,30})\s*[:=]\s*(.+)$/);
    if (m) out[m[1].trim().toLowerCase().replace(/\s+/g, '_')] = m[2].trim();
  }
  return out;
}

function tryJson(text: string): Record<string, any> | null {
  try { return JSON.parse(text); } catch { return null; }
}

export const GenericFormDetector: Detector = {
  detect(m: Mail): LeadCandidate[] {
    const results: LeadCandidate[] = [];
    const kv = parseKeyValues(m.text);
    if (Object.keys(kv).length) {
      results.push({ subscriber: kv, source: 'email:kv' });
    }
    const js = tryJson(m.text);
    if (js && typeof js === 'object') {
      results.push({ subscriber: js, source: 'email:json' });
    }
    return results;
  },
};

