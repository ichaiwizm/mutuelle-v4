/**
 * OpenRouter Service
 *
 * Calls OpenRouter API with GPT-4o-mini for flexible lead parsing.
 * Used as a fallback when standard parsers fail to recognize the format.
 */

import { logger } from "@/main/services/logger";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-5-mini-2025-08-07";

// API key injected at build time
const API_KEY = process.env.OPENROUTER_API_KEY || "";

export interface ParsedLeadData {
  civilite?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  dateNaissance?: string;
  codePostal?: string;
  ville?: string;
  adresse?: string;
  regimeSocial?: string;
  profession?: string;
  dateEffet?: string;
  conjoint?: {
    civilite?: string;
    nom?: string;
    prenom?: string;
    dateNaissance?: string;
    regimeSocial?: string;
    profession?: string;
  } | null;
  enfants?: Array<{
    dateNaissance?: string;
    regimeSocial?: string;
  }>;
}

const SYSTEM_PROMPT = `Tu es un parser de leads pour une application de gestion de mutuelles.
Ton rôle est d'extraire les informations d'un prospect à partir du texte fourni (email, formulaire, etc.).

IMPORTANT:
- Retourne UNIQUEMENT un objet JSON valide, sans texte avant ou après
- Si une information n'est pas présente, omets le champ (ne mets pas null ou "")
- Les dates doivent être au format DD/MM/YYYY
- Le téléphone doit être au format français (10 chiffres, peut avoir des espaces ou points)
- Le régime social peut être: "Général", "TNS", "Agricole", "Alsace-Moselle", etc.

Structure JSON attendue:
{
  "civilite": "M." ou "Mme",
  "nom": "NOM en majuscules",
  "prenom": "Prénom",
  "email": "email@example.com",
  "telephone": "06 12 34 56 78",
  "dateNaissance": "DD/MM/YYYY",
  "codePostal": "75001",
  "ville": "Paris",
  "adresse": "123 rue Example",
  "regimeSocial": "Général",
  "profession": "Cadre",
  "dateEffet": "DD/MM/YYYY",
  "conjoint": {
    "civilite": "M." ou "Mme",
    "nom": "NOM",
    "prenom": "Prénom",
    "dateNaissance": "DD/MM/YYYY",
    "regimeSocial": "Général",
    "profession": "Employé"
  },
  "enfants": [
    { "dateNaissance": "DD/MM/YYYY", "regimeSocial": "Général" }
  ]
}`;

export async function parseLeadWithLLM(text: string): Promise<ParsedLeadData | null> {
  if (!API_KEY) {
    logger.warn("OpenRouter API key not configured", { service: "LLM" });
    return null;
  }

  try {
    logger.info("Calling OpenRouter API for lead parsing", {
      service: "LLM",
      textLength: text.length,
    });

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://mutuelle.france-epargne.fr",
        "X-Title": "Mutuelle App",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Extrais les informations du lead suivant:\n\n${text}`,
          },
        ],
        temperature: 0.1, // Low temperature for consistent parsing
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("OpenRouter API error", {
        service: "LLM",
        status: response.status,
        error: errorText,
      });
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      logger.warn("Empty response from OpenRouter", { service: "LLM" });
      return null;
    }

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.warn("No JSON found in OpenRouter response", {
        service: "LLM",
        content,
      });
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as ParsedLeadData;

    // Validate required fields
    if (!parsed.nom && !parsed.prenom && !parsed.email && !parsed.telephone) {
      logger.warn("LLM parsed data missing required fields", {
        service: "LLM",
        parsed,
      });
      return null;
    }

    logger.info("Successfully parsed lead with LLM", {
      service: "LLM",
      hasConjoint: !!parsed.conjoint,
      childCount: parsed.enfants?.length || 0,
    });

    return parsed;
  } catch (error) {
    logger.error("Failed to parse lead with LLM", { service: "LLM" }, error);
    return null;
  }
}

/**
 * Check if LLM parsing is available (API key configured)
 */
export function isLLMParsingAvailable(): boolean {
  return !!API_KEY;
}
