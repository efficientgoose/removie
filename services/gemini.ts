import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  buildFinalRecommendationPrompt,
  buildInitialSuggestionsPrompt,
  normalizeRecommendationReason,
} from "../constants/prompts";
import type { GeminiMovieSuggestion, GeminiRecommendation, TMDBMovie, UserFilters } from "../types";

const GEMINI_MODEL = "gemini-2.0-flash-lite";
const TEMPERATURE = 0.7;
const MAX_RETRIES = 0;

class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiError";
  }
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError("Missing EXPO_PUBLIC_GEMINI_API_KEY.");
  }

  return new GoogleGenerativeAI(apiKey);
}

function stripMarkdownCodeFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function extractJsonPayload(raw: string): string {
  const cleaned = stripMarkdownCodeFences(raw);
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");

  if (firstBrace === -1 && firstBracket === -1) {
    return cleaned;
  }

  const starts = [firstBrace, firstBracket].filter((n) => n !== -1);
  const start = Math.min(...starts);

  if (cleaned[start] === "[") {
    const end = cleaned.lastIndexOf("]");
    return end > start ? cleaned.slice(start, end + 1) : cleaned.slice(start);
  }

  const end = cleaned.lastIndexOf("}");
  return end > start ? cleaned.slice(start, end + 1) : cleaned.slice(start);
}

function parseJson<T>(text: string): T {
  const payload = extractJsonPayload(text);

  try {
    return JSON.parse(payload) as T;
  } catch {
    throw new GeminiError("Gemini returned invalid JSON.");
  }
}

function validateSuggestionArray(data: unknown, expectedCount: number): GeminiMovieSuggestion[] {
  if (!Array.isArray(data)) {
    throw new GeminiError("Gemini suggestions response is not an array.");
  }

  const suggestions = data
    .map((item): GeminiMovieSuggestion | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as Partial<GeminiMovieSuggestion>;
      if (
        typeof candidate.title !== "string" ||
        typeof candidate.year !== "number" ||
        typeof candidate.originalLanguage !== "string"
      ) {
        return null;
      }

      return {
        title: candidate.title.trim(),
        year: Math.floor(candidate.year),
        originalLanguage: candidate.originalLanguage.trim().toLowerCase(),
      };
    })
    .filter((item): item is GeminiMovieSuggestion => Boolean(item));

  if (suggestions.length !== expectedCount) {
    throw new GeminiError(
      `Gemini returned ${suggestions.length} suggestions, expected ${expectedCount}.`,
    );
  }

  return suggestions;
}

function validateRecommendation(data: unknown): GeminiRecommendation {
  if (!data || typeof data !== "object") {
    throw new GeminiError("Gemini final recommendation response is invalid.");
  }

  const candidate = data as Partial<GeminiRecommendation>;

  if (
    typeof candidate.title !== "string" ||
    typeof candidate.year !== "number" ||
    typeof candidate.originalLanguage !== "string" ||
    typeof candidate.reason !== "string"
  ) {
    throw new GeminiError("Gemini final recommendation is missing required fields.");
  }

  return {
    title: candidate.title.trim(),
    year: Math.floor(candidate.year),
    originalLanguage: candidate.originalLanguage.trim().toLowerCase(),
    reason: normalizeRecommendationReason({
      title: candidate.title,
      year: candidate.year,
      originalLanguage: candidate.originalLanguage,
      reason: candidate.reason,
    }),
  };
}

async function generateJson<T>(prompt: string, validate: (data: unknown) => T, retries = MAX_RETRIES): Promise<T> {
  const model = getGeminiClient().getGenerativeModel({ model: GEMINI_MODEL });

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: TEMPERATURE,
          responseMimeType: "application/json",
        },
      });

      const text = result.response.text();
      const parsed = parseJson<unknown>(text);
      return validate(parsed);
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
    }
  }

  if (lastError instanceof Error) {
    throw new GeminiError(lastError.message);
  }

  throw new GeminiError("Gemini generation failed.");
}

export async function getInitialSuggestions(
  filters: UserFilters,
  count = 10,
): Promise<GeminiMovieSuggestion[]> {
  const prompt = buildInitialSuggestionsPrompt(filters, count);
  return generateJson(prompt, (data) => validateSuggestionArray(data, count));
}

interface FinalRecommendationInput {
  likedMovies: TMDBMovie[];
  dislikedMovies: TMDBMovie[];
  excludedTitles?: string[];
}

export async function getFinalRecommendation({
  likedMovies,
  dislikedMovies,
  excludedTitles = [],
}: FinalRecommendationInput): Promise<GeminiRecommendation> {
  const prompt = buildFinalRecommendationPrompt(likedMovies, dislikedMovies, excludedTitles);
  return generateJson(prompt, validateRecommendation);
}
