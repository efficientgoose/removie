import type { ContentType, GeminiMovieSuggestion, MediaType, TMDBMovie } from "../types";
import { findBestTmdbMatch } from "../utils/matching";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

interface TMDBSearchResponse {
  results: TMDBRawMedia[];
}

interface TMDBRawMedia {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  original_language?: string;
}

interface TMDBWatchProviderResponse {
  results?: {
    [countryCode: string]: {
      flatrate?: Array<{ provider_name: string }>;
      rent?: Array<{ provider_name: string }>;
      buy?: Array<{ provider_name: string }>;
    };
  };
}

class TMDBError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TMDBError";
  }
}

function getTmdbApiKey(): string {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new TMDBError("Missing EXPO_PUBLIC_TMDB_API_KEY.");
  }

  return apiKey;
}

function toTmdbMovie(raw: TMDBRawMedia, mediaType: MediaType): TMDBMovie {
  return {
    id: raw.id,
    mediaType,
    title: (raw.title ?? raw.name ?? "").trim(),
    originalTitle: (raw.original_title ?? raw.original_name ?? "").trim(),
    overview: raw.overview ?? "",
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    releaseDate: raw.release_date ?? raw.first_air_date ?? "",
    voteAverage: raw.vote_average ?? 0,
    voteCount: raw.vote_count ?? 0,
    genreIds: raw.genre_ids ?? raw.genres?.map((genre) => genre.id) ?? [],
    originalLanguage: (raw.original_language ?? "").toLowerCase(),
  };
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | undefined> = {}): Promise<T> {
  const apiKey = getTmdbApiKey();

  const searchParams = new URLSearchParams({
    api_key: apiKey,
    ...Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined)),
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new TMDBError(`TMDB request failed (${response.status}) for ${endpoint}.`);
  }

  return (await response.json()) as T;
}

export function getTMDBImageUrl(path: string | null, size: "w185" | "w342" | "w500" | "original" = "w500"):
  | string
  | null {
  if (!path) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export async function searchMovies(title: string, year?: number): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBSearchResponse>("/search/movie", {
    query: title,
    year: year ? String(year) : undefined,
    include_adult: "false",
  });

  return data.results.map((item) => toTmdbMovie(item, "movie"));
}

export async function searchSeries(title: string, year?: number): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBSearchResponse>("/search/tv", {
    query: title,
    first_air_date_year: year ? String(year) : undefined,
    include_adult: "false",
  });

  return data.results.map((item) => toTmdbMovie(item, "tv"));
}

export async function getMovieDetails(id: number): Promise<TMDBMovie> {
  const data = await tmdbFetch<TMDBRawMedia>(`/movie/${id}`);
  return toTmdbMovie(data, "movie");
}

export async function getSeriesDetails(id: number): Promise<TMDBMovie> {
  const data = await tmdbFetch<TMDBRawMedia>(`/tv/${id}`);
  return toTmdbMovie(data, "tv");
}

export async function getWatchProviders(
  mediaType: MediaType,
  id: number,
  countryCode = "US",
): Promise<string[]> {
  const data = await tmdbFetch<TMDBWatchProviderResponse>(`/${mediaType}/${id}/watch/providers`);
  const countryProviders = data.results?.[countryCode];

  if (!countryProviders) {
    return [];
  }

  const names = [
    ...(countryProviders.flatrate ?? []),
    ...(countryProviders.rent ?? []),
    ...(countryProviders.buy ?? []),
  ].map((provider) => provider.provider_name);

  return [...new Set(names)];
}

function filterByLanguage(candidates: TMDBMovie[], languageCode?: string): TMDBMovie[] {
  if (!languageCode) {
    return candidates;
  }

  const normalized = languageCode.toLowerCase();
  const exactMatches = candidates.filter((candidate) => candidate.originalLanguage === normalized);

  return exactMatches.length ? exactMatches : candidates;
}

export async function resolveSuggestionOnTMDB(
  suggestion: GeminiMovieSuggestion,
  contentType: ContentType,
): Promise<TMDBMovie | null> {
  const mediaTypes: MediaType[] =
    contentType === "both" ? ["movie", "tv"] : contentType === "movie" ? ["movie"] : ["tv"];

  const allCandidates: TMDBMovie[] = [];

  for (const mediaType of mediaTypes) {
    const results =
      mediaType === "movie"
        ? await searchMovies(suggestion.title, suggestion.year)
        : await searchSeries(suggestion.title, suggestion.year);

    allCandidates.push(...filterByLanguage(results, suggestion.originalLanguage));
  }

  return findBestTmdbMatch(suggestion, allCandidates);
}
