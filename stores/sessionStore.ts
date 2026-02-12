import { create } from "zustand";

import type { MediaType, SwipeResult, SwipeSession, SwipeableMovie, TMDBMovie, UserFilters } from "../types";

interface SessionStoreState extends SwipeSession {
  loading: boolean;
  error: string | null;
  setFilters: (filters: UserFilters) => void;
  updateFilters: (updates: Partial<UserFilters>) => void;
  setInitialMovies: (movies: TMDBMovie[]) => void;
  markSwipe: (movieId: number, mediaType: MediaType, result: SwipeResult) => void;
  setFinalRecommendation: (movie: TMDBMovie | null, reason: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetRecommendation: () => void;
  resetSession: (keepFilters?: boolean) => void;
}

const DEFAULT_FILTERS: UserFilters = {
  contentType: "both",
  languages: [],
  genres: [],
  yearRange: "all",
  vibeDescription: "",
};

function toSwipeableMovies(movies: TMDBMovie[]): SwipeableMovie[] {
  return movies.map((movie) => ({
    ...movie,
    swiped: false,
    result: undefined,
  }));
}

function sameMovie(left: TMDBMovie, movieId: number, mediaType: MediaType): boolean {
  return left.id === movieId && left.mediaType === mediaType;
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  filters: DEFAULT_FILTERS,
  initialMovies: [],
  likedMovies: [],
  dislikedMovies: [],
  finalRecommendation: null,
  recommendationReason: null,
  loading: false,
  error: null,

  setFilters: (filters) => set({ filters }),

  updateFilters: (updates) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...updates,
      },
    })),

  setInitialMovies: (movies) =>
    set({
      initialMovies: toSwipeableMovies(movies),
      likedMovies: [],
      dislikedMovies: [],
      finalRecommendation: null,
      recommendationReason: null,
    }),

  markSwipe: (movieId, mediaType, result) =>
    set((state) => {
      const updatedInitialMovies = state.initialMovies.map((movie) =>
        sameMovie(movie, movieId, mediaType) ? { ...movie, swiped: true, result } : movie,
      );
      const targetMovie = updatedInitialMovies.find((movie) => sameMovie(movie, movieId, mediaType));

      if (!targetMovie) {
        return {};
      }

      const movieForLists: TMDBMovie = {
        id: targetMovie.id,
        mediaType: targetMovie.mediaType,
        title: targetMovie.title,
        originalTitle: targetMovie.originalTitle,
        overview: targetMovie.overview,
        posterPath: targetMovie.posterPath,
        backdropPath: targetMovie.backdropPath,
        releaseDate: targetMovie.releaseDate,
        voteAverage: targetMovie.voteAverage,
        voteCount: targetMovie.voteCount,
        genreIds: targetMovie.genreIds,
        originalLanguage: targetMovie.originalLanguage,
      };

      const likedWithoutMovie = state.likedMovies.filter((movie) => !sameMovie(movie, movieId, mediaType));
      const dislikedWithoutMovie = state.dislikedMovies.filter(
        (movie) => !sameMovie(movie, movieId, mediaType),
      );

      if (result === "like") {
        return {
          initialMovies: updatedInitialMovies,
          likedMovies: [...likedWithoutMovie, movieForLists],
          dislikedMovies: dislikedWithoutMovie,
        };
      }

      return {
        initialMovies: updatedInitialMovies,
        likedMovies: likedWithoutMovie,
        dislikedMovies: [...dislikedWithoutMovie, movieForLists],
      };
    }),

  setFinalRecommendation: (movie, reason) =>
    set({
      finalRecommendation: movie,
      recommendationReason: reason,
    }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  resetRecommendation: () =>
    set({
      finalRecommendation: null,
      recommendationReason: null,
      error: null,
    }),

  resetSession: (keepFilters = false) =>
    set((state) => ({
      filters: keepFilters ? state.filters : DEFAULT_FILTERS,
      initialMovies: [],
      likedMovies: [],
      dislikedMovies: [],
      finalRecommendation: null,
      recommendationReason: null,
      loading: false,
      error: null,
    })),
}));
