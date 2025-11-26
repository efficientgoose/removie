import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { Movie, GameState, GameMode } from '../types';

// Configuration
const BASE_URL = "https://api.themoviedb.org/3";

interface GameStore {
  // State
  apiKey: string;
  view: GameState;
  gameMode: GameMode | null;
  movies: Movie[];
  liked: Movie[];
  currentIndex: number;
  winner: Movie | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setApiKey: (key: string) => void;
  setView: (view: GameState) => void;
  setGameMode: (mode: GameMode) => void;
  loadMovies: (vibeParams: Record<string, any>) => Promise<void>;
  swipe: (direction: 'left' | 'right') => void;
  spinWheel: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      apiKey: "",
      view: 'SETUP',
      gameMode: null,
      movies: [],
      liked: [],
      currentIndex: 0,
      winner: null,
      isLoading: false,
      error: null,

      setApiKey: (key) => set({ apiKey: key, view: 'HOME' }),
      
      setView: (view) => set({ view }),

      setGameMode: (mode) => set({ gameMode: mode, view: 'VIBES' }),

      loadMovies: async (vibeParams) => {
        const { apiKey } = get();
        set({ isLoading: true, error: null });
        
        console.log("Loading movies with params:", vibeParams);
        console.log("API Key present:", !!apiKey);
        
        try {
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

          // Filter & Shuffle
          const validMovies = data.results
            .filter((m: Movie) => m.poster_path)
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);

          if (validMovies.length === 0) {
            set({ error: "No movies found for this vibe. Try another!", isLoading: false });
            return;
          }

          set({ movies: validMovies, liked: [], currentIndex: 0, view: 'SWIPE' });
        } catch (err: any) {
          console.error("API Error:", err);
          console.error("Response:", err.response?.data);
          console.error("Status:", err.response?.status);
          
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
          
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      swipe: (direction) => {
        const { movies, currentIndex, liked } = get();
        const currentMovie = movies[currentIndex];

        if (direction === 'right') {
          set({ liked: [...liked, currentMovie] });
        }

        // Check if end of stack
        if (currentIndex >= movies.length - 1) {
          const newLikedCount = direction === 'right' ? liked.length + 1 : liked.length;
          if (newLikedCount === 0) {
            alert("No matches! Try again.");
            set({ view: 'VIBES' });
          } else {
            set({ view: 'SPIN' });
          }
        } else {
          set({ currentIndex: currentIndex + 1 });
        }
      },

      spinWheel: () => {
        set({ isLoading: true });
        const { liked, movies } = get();
        const pool = liked.length > 0 ? liked : movies;
        
        // Simulate delay
        setTimeout(() => {
          const randomPick = pool[Math.floor(Math.random() * pool.length)];
          set({ winner: randomPick, view: 'WINNER', isLoading: false });
        }, 1500);
      },

      resetGame: () => set({ view: 'HOME', gameMode: null, liked: [], movies: [], currentIndex: 0, winner: null })
    }),
    {
      name: 'moviematch-storage', // unique name for localStorage
      partialize: (state) => ({ apiKey: state.apiKey }), // Only persist API key
    }
  )
);