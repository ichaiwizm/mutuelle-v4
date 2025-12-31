/**
 * Lead ID generation utility
 */

import { createHash } from "crypto";

/**
 * Generates a deterministic UUID-like ID from subscriber data
 * Same lead data = same ID, enabling deduplication via primary key
 */
export function generateLeadId(subscriber: Record<string, unknown>): string {
  const key = [
    subscriber.nom,
    subscriber.prenom,
    subscriber.email,
    subscriber.telephone,
    subscriber.dateNaissance,
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase().trim())
    .join("|");

  const hash = createHash("sha256").update(key).digest("hex");
  // Format as UUID v4-like: xxxxxxxx-xxxx-4xxx-axxx-xxxxxxxxxxxx
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
