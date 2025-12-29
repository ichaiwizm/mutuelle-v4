import type { DevisData } from "@/shared/types/devis";

/**
 * French labels for common devis data fields
 */
const LABELS_FR: Record<string, string> = {
  monthlyPremium: "Cotisation mensuelle",
  yearlyPremium: "Cotisation annuelle",
  coverageLevel: "Niveau de couverture",
  formuleName: "Formule",
  effectiveDate: "Date d'effet",
  guaranteeLevel: "Niveau de garantie",
  deductible: "Franchise",
  waitingPeriod: "Délai de carence",
  renewalDate: "Date de renouvellement",
  contractNumber: "Numéro de contrat",
  refundRate: "Taux de remboursement",
};

/**
 * Get the French label for a devis data key
 */
export function getFieldLabel(key: string): string {
  return LABELS_FR[key] || formatKeyToLabel(key);
}

/**
 * Convert a camelCase or snake_case key to a readable label
 */
function formatKeyToLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\s/, "")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Format a value based on the key type
 */
export function formatFieldValue(key: string, value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  // Currency fields
  if (
    key.toLowerCase().includes("premium") ||
    key.toLowerCase().includes("price") ||
    key.toLowerCase().includes("amount") ||
    key.toLowerCase().includes("cotisation")
  ) {
    const num = Number(value);
    if (!isNaN(num)) {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(num);
    }
  }

  // Date fields
  if (key.toLowerCase().includes("date")) {
    try {
      const date = new Date(value as string);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    } catch {
      // Fall through to default
    }
  }

  // Percentage fields
  if (
    key.toLowerCase().includes("rate") ||
    key.toLowerCase().includes("taux") ||
    key.toLowerCase().includes("percent")
  ) {
    const num = Number(value);
    if (!isNaN(num)) {
      return `${num}%`;
    }
  }

  // Boolean fields
  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  return String(value);
}

/**
 * Format devis data into key-value pairs with French labels
 */
export function formatDevisData(
  data: DevisData | null | undefined
): Array<{ key: string; label: string; value: string }> {
  if (!data) {
    return [];
  }

  return Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => ({
      key,
      label: getFieldLabel(key),
      value: formatFieldValue(key, value),
    }));
}

/**
 * Get the best price from devis data (monthly or yearly premium)
 */
export function getBestPrice(data: DevisData | null | undefined): string | null {
  if (!data) return null;

  if (data.monthlyPremium !== undefined && data.monthlyPremium !== null) {
    return formatFieldValue("monthlyPremium", data.monthlyPremium);
  }

  if (data.yearlyPremium !== undefined && data.yearlyPremium !== null) {
    return formatFieldValue("yearlyPremium", data.yearlyPremium);
  }

  return null;
}
