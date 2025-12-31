import { logger } from "@/main/services/logger";
import type { ParsedLeadData } from "./types";
import { SYSTEM_PROMPT } from "./prompt";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-5-mini-2025-08-07";
const API_KEY = process.env.OPENROUTER_API_KEY || "";

export type { ParsedLeadData };

export async function parseLeadWithLLM(text: string): Promise<ParsedLeadData | null> {
  if (!API_KEY) {
    logger.warn("OpenRouter API key not configured", { service: "LLM" });
    return null;
  }

  try {
    logger.info("Calling OpenRouter API for lead parsing", { service: "LLM", textLength: text.length });

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
          { role: "user", content: `Extrais les informations du lead suivant:\n\n${text}` },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("OpenRouter API error", { service: "LLM", status: response.status, error: errorText });
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      logger.warn("Empty response from OpenRouter", { service: "LLM" });
      return null;
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.warn("No JSON found in OpenRouter response", { service: "LLM", content });
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as ParsedLeadData;

    if (!parsed.nom && !parsed.prenom && !parsed.email && !parsed.telephone) {
      logger.warn("LLM parsed data missing required fields", { service: "LLM", parsed });
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

export function isLLMParsingAvailable(): boolean {
  return !!API_KEY;
}
