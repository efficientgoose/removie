import axios from 'axios';
import type { Movie } from '../types';

const BASE_URL = "https://api.themoviedb.org/3";

export interface TMDBError {
  status_code: number;
  status_message: string;
}

export interface DiscoverMoviesParams {
  with_genres?: string;
  "vote_average.gte"?: number;
  "vote_count.gte"?: number;
  with_runtime_lte?: number;
}

export const tmdbApi = {
  /**
   * Fetch movies from TMDB Discovery API
   * NOTE: For production, consider proxying API calls through a backend
   * to avoid exposing API keys in client-side code
   */
  discoverMovies: async (
    apiKey: string,
    vibeParams: DiscoverMoviesParams
  ): Promise<Movie[]> => {
    const { data } = await axios.get(`${BASE_URL}/discover/movie`, {
      params: {
        api_key: apiKey,
        language: "en-US",
        sort_by: "popularity.desc",
        page: 1,
        include_adult: false,
        ...vibeParams,
      },
    });

    // Filter for movies with posters, shuffle, and limit to 10
    const validMovies = data.results
      .filter((m: Movie) => m.poster_path)
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    return validMovies;
  },

  /**
   * Parse TMDB API errors into user-friendly messages
   */
  parseError: (err: any): string => {
    let errorMessage = "Failed to load movies. ";

    if (err.response?.status === 401) {
      errorMessage += "Invalid API key.";
    } else if (err.response?.status === 404) {
      errorMessage += "API endpoint not found.";
    } else if (err.response?.status === 429) {
      errorMessage += "Too many requests. Please wait.";
    } else if (err.response?.data?.status_message) {
      errorMessage += err.response.data.status_message;
    } else {
      errorMessage += "Check your connection and API key.";
    }

    return errorMessage;
  }
};