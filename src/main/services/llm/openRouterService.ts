/**
 * OpenRouter Service
 *
 * Calls OpenRouter API with GPT-4o-mini for flexible lead parsing.
 * Used as a fallback when standard parsers fail to recognize the format.
 */

import { logger } from "@/main/services/logger";
import { captureException, addBreadcrumb } from "@/main/services/monitoring";
import { LLMParsingError, type LLMParsingErrorType } from "@/shared/errors";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-5-mini-2025-08-07";
const API_KEY = process.env.OPENROUTER_API_KEY || "";
const REQUEST_TIMEOUT_MS = 30000;

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

/**
 * Capture une erreur LLM vers Sentry avec contexte détaillé
 */
function captureLLMError(
  errorType: LLMParsingErrorType,
  message: string,
  details: {
    httpStatus?: number;
    textLength?: number;
    responseContent?: string;
    missingFields?: string[];
    error?: unknown;
  }
): void {
  const error = new LLMParsingError(errorType, message, {
    httpStatus: details.httpStatus,
    textLength: details.textLength,
    missingFields: details.missingFields,
  });

  logger.error(message, {
    service: "LLM",
    errorType,
    httpStatus: details.httpStatus,
    textLength: details.textLength,
  }, details.error);

  captureException(error, {
    tags: {
      service: "llm-parsing",
      error_type: errorType,
      model: MODEL,
      ...(details.httpStatus && { http_status: String(details.httpStatus) }),
    },
    extra: {
      textLength: details.textLength,
      model: MODEL,
      apiUrl: OPENROUTER_API_URL,
      timeoutMs: REQUEST_TIMEOUT_MS,
      ...(details.responseContent && {
        responseContent: details.responseContent.slice(0, 500),
      }),
      ...(details.missingFields && { missingFields: details.missingFields }),
    },
  });
}

/**
 * Mappe un code HTTP vers un type d'erreur LLM
 */
function httpStatusToErrorType(status: number): LLMParsingErrorType {
  if (status === 401) return "API_KEY_INVALID";
  if (status === 429) return "RATE_LIMIT";
  if (status === 404) return "MODEL_NOT_FOUND";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN";
}

export async function parseLeadWithLLM(text: string): Promise<ParsedLeadData | null> {
  const textLength = text.length;

  if (!API_KEY) {
    captureLLMError("API_KEY_MISSING", "OpenRouter API key not configured - LLM parsing disabled", {
      textLength,
    });
    return null;
  }

  addBreadcrumb("llm-parsing", "Starting LLM parsing", { textLength, model: MODEL }, "info");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(OPENROUTER_API_URL, {
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
          temperature: 0.1,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        captureLLMError("TIMEOUT", `OpenRouter request timed out after ${REQUEST_TIMEOUT_MS}ms`, {
          textLength,
          error: fetchError,
        });
        return null;
      }

      captureLLMError("NETWORK_ERROR", "OpenRouter request failed - network error", {
        textLength,
        error: fetchError,
      });
      return null;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unable to read error response");
      const errorType = httpStatusToErrorType(response.status);

      captureLLMError(errorType, `OpenRouter API error: ${response.status} ${response.statusText}`, {
        httpStatus: response.status,
        textLength,
        responseContent: errorText,
      });
      return null;
    }

    addBreadcrumb("llm-parsing", "API response received", { status: response.status }, "info");

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      captureLLMError("EMPTY_RESPONSE", "Empty response from OpenRouter - no content in choices", {
        textLength,
        responseContent: JSON.stringify(data).slice(0, 500),
      });
      return null;
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      captureLLMError("JSON_PARSE_ERROR", "No JSON found in OpenRouter response", {
        textLength,
        responseContent: content.slice(0, 500),
      });
      return null;
    }

    let parsed: ParsedLeadData;
    try {
      parsed = JSON.parse(jsonMatch[0]) as ParsedLeadData;
    } catch (parseError) {
      captureLLMError("JSON_PARSE_ERROR", "Failed to parse JSON from OpenRouter response", {
        textLength,
        responseContent: jsonMatch[0].slice(0, 500),
        error: parseError,
      });
      return null;
    }

    const missingFields: string[] = [];
    if (!parsed.nom) missingFields.push("nom");
    if (!parsed.prenom) missingFields.push("prenom");
    if (!parsed.email) missingFields.push("email");
    if (!parsed.telephone) missingFields.push("telephone");

    if (missingFields.length === 4) {
      captureLLMError("MISSING_FIELDS", "LLM parsed data missing all required fields", {
        textLength,
        missingFields,
      });
      return null;
    }

    addBreadcrumb(
      "llm-parsing",
      "Successfully parsed lead",
      {
        hasConjoint: !!parsed.conjoint,
        childCount: parsed.enfants?.length || 0,
      },
      "info"
    );

    logger.info("Successfully parsed lead with LLM", {
      service: "LLM",
      hasConjoint: !!parsed.conjoint,
      childCount: parsed.enfants?.length || 0,
    });

    return parsed;
  } catch (error) {
    captureLLMError("UNKNOWN", "Unexpected error during LLM parsing", {
      textLength,
      error,
    });
    return null;
  }
}

/**
 * Check if LLM parsing is available (API key configured)
 */
export function isLLMParsingAvailable(): boolean {
  return !!API_KEY;
}
