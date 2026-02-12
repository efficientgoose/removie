export type ContentType = "movie" | "series" | "both";
export type YearRange = "all" | "2020s" | "2010s" | "2000s" | "classic";
export type SwipeResult = "like" | "dislike";
export type MediaType = "movie" | "tv";

export interface UserFilters {
  contentType: ContentType;
  languages: string[];
  genres: string[];
  yearRange: YearRange;
  vibeDescription?: string;
}

export interface GeminiMovieSuggestion {
  title: string;
  year: number;
  originalLanguage: string;
}

export interface TMDBMovie {
  id: number;
  mediaType: MediaType;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  originalLanguage: string;
}

export interface SwipeableMovie extends TMDBMovie {
  swiped: boolean;
  result?: SwipeResult;
}

export interface SwipeSession {
  filters: UserFilters;
  initialMovies: SwipeableMovie[];
  likedMovies: TMDBMovie[];
  dislikedMovies: TMDBMovie[];
  finalRecommendation: TMDBMovie | null;
  recommendationReason: string | null;
}

export interface GeminiRecommendation {
  title: string;
  year: number;
  originalLanguage: string;
  reason: string;
}
