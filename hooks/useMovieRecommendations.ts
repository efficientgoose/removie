import { useCallback } from "react";

import { getFinalRecommendation, getInitialSuggestions } from "../services/gemini";
import { resolveSuggestionOnTMDB } from "../services/tmdb";
import { useSessionStore } from "../stores/sessionStore";
import type { GeminiMovieSuggestion, TMDBMovie, SwipeableMovie, UserFilters } from "../types";

const INITIAL_BATCH_SIZE = 10;
const EXTRA_BATCH_SIZE = 5;
const MIN_VALID_RECOMMENDATIONS = 3;
const MAX_EXTRA_FETCH_ATTEMPTS = 1;

function uniqueSuggestionKey(suggestion: GeminiMovieSuggestion): string {
  return `${suggestion.title.toLowerCase()}::${suggestion.year}::${suggestion.originalLanguage.toLowerCase()}`;
}

function uniqueMediaKey(movie: TMDBMovie): string {
  return `${movie.mediaType}::${movie.id}`;
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function pickMostUniqueMovie(movies: TMDBMovie[], excludedTitles: string[] = []): TMDBMovie | null {
  if (movies.length === 0) {
    return null;
  }

  const excluded = new Set(excludedTitles.map(normalizeTitle));
  const candidates = movies.filter((movie) => !excluded.has(normalizeTitle(movie.title)));

  if (candidates.length === 0) {
    return null;
  }

  const [selected] = [...candidates].sort((left, right) => {
    if (left.voteCount !== right.voteCount) {
      return left.voteCount - right.voteCount;
    }

    return right.voteAverage - left.voteAverage;
  });

  return selected ?? null;
}

async function validateSuggestions(
  suggestions: GeminiMovieSuggestion[],
  filters: UserFilters,
): Promise<TMDBMovie[]> {
  const validated: TMDBMovie[] = [];
  const seen = new Set<string>();

  for (const suggestion of suggestions) {
    const movie = await resolveSuggestionOnTMDB(suggestion, filters.contentType);
    if (!movie) {
      continue;
    }

    if (filters.languages.length > 0 && !filters.languages.includes(movie.originalLanguage)) {
      continue;
    }

    const key = uniqueMediaKey(movie);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    validated.push(movie);
  }

  return validated;
}

export function useMovieRecommendations() {
  const initialMovies = useSessionStore((state) => state.initialMovies);
  const finalRecommendation = useSessionStore((state) => state.finalRecommendation);
  const recommendationReason = useSessionStore((state) => state.recommendationReason);
  const loading = useSessionStore((state) => state.loading);
  const error = useSessionStore((state) => state.error);
  const setInitialMovies = useSessionStore((state) => state.setInitialMovies);
  const resetRecommendation = useSessionStore((state) => state.resetRecommendation);

  const fetchInitialMovies = useCallback(
    async (filters: UserFilters) => {
      useSessionStore.setState({ loading: true, error: null });

      try {
        const collectedSuggestions = new Map<string, GeminiMovieSuggestion>();

        const firstBatch = await getInitialSuggestions(filters, INITIAL_BATCH_SIZE);
        firstBatch.forEach((suggestion) => collectedSuggestions.set(uniqueSuggestionKey(suggestion), suggestion));

        let validated = await validateSuggestions([...collectedSuggestions.values()], filters);

        let attempts = 0;
        while (validated.length < MIN_VALID_RECOMMENDATIONS && attempts < MAX_EXTRA_FETCH_ATTEMPTS) {
          attempts += 1;
          await new Promise((r) => setTimeout(r, 2000));
          const extraSuggestions = await getInitialSuggestions(filters, EXTRA_BATCH_SIZE);

          extraSuggestions.forEach((suggestion) =>
            collectedSuggestions.set(uniqueSuggestionKey(suggestion), suggestion),
          );

          validated = await validateSuggestions([...collectedSuggestions.values()], filters);
        }

        if (validated.length === 0) {
          throw new Error("No valid movies found for these filters. Try broader filters.");
        }

        const sliced = validated.slice(0, INITIAL_BATCH_SIZE);
        setInitialMovies(sliced);
        useSessionStore.setState({ loading: false });

        return sliced.map<SwipeableMovie>((movie) => ({
          ...movie,
          swiped: false,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load recommendations.";
        useSessionStore.setState({ error: message, initialMovies: [], likedMovies: [], dislikedMovies: [], loading: false });
        return [];
      }
    },
    [setInitialMovies],
  );

  interface FetchFinalRecommendationOptions {
    excludedTitles?: string[];
    preserveCurrentOnError?: boolean;
  }

  const fetchFinalRecommendation = useCallback(
    async (
      likedMovies: TMDBMovie[],
      dislikedMovies: TMDBMovie[],
      options?: FetchFinalRecommendationOptions,
    ) => {
      useSessionStore.setState({ loading: true, error: null });

      try {
        if (likedMovies.length === 0 && dislikedMovies.length === 0) {
          throw new Error("Swipe at least one title before requesting a recommendation.");
        }

        if (likedMovies.length === 0 && dislikedMovies.length > 0) {
          throw new Error("You disliked everything. Adjust filters and try again.");
        }

        const excluded = [...new Set(options?.excludedTitles ?? [])];
        const fallbackUniquePick = pickMostUniqueMovie(likedMovies, excluded);

        // If the user liked everything in the deck, return the most distinctive pick first.
        if (likedMovies.length > 0 && dislikedMovies.length === 0 && fallbackUniquePick) {
          useSessionStore.setState({
            finalRecommendation: fallbackUniquePick,
            recommendationReason: "You liked every option, so we picked the most distinctive one from your deck to keep your watchlist fresh.",
            loading: false,
          });
          return fallbackUniquePick;
        }

        for (let attempt = 0; attempt < 2; attempt += 1) {
          const recommendation = await getFinalRecommendation({
            likedMovies,
            dislikedMovies,
            excludedTitles: excluded,
          });

          const resolved = await resolveSuggestionOnTMDB(recommendation, "both");
          if (!resolved) {
            excluded.push(recommendation.title);
            continue;
          }

          useSessionStore.setState({
            finalRecommendation: resolved,
            recommendationReason: recommendation.reason,
            loading: false,
          });
          return resolved;
        }

        throw new Error("Final recommendation could not be validated. Please retry.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get final recommendation.";
        if (options?.preserveCurrentOnError) {
          useSessionStore.setState({ error: message, loading: false });
        } else {
          useSessionStore.setState({ error: message, finalRecommendation: null, recommendationReason: null, loading: false });
        }
        return null;
      }
    },
    [],
  );

  return {
    initialMovies,
    finalRecommendation,
    recommendationReason,
    loading,
    error,
    fetchInitialMovies,
    fetchFinalRecommendation,
    resetRecommendation,
  };
}
