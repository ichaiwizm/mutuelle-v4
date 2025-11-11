export function buildGmailQuery(days: number): string {
  const d = Math.max(0, Math.floor(days || 0));
  const newer = d > 0 ? ` newer_than:${d}d` : '';
  return `label:inbox${newer} -category:promotions -category:social`;
}

