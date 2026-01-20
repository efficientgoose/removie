export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export interface Vibe {
  id: string;
  label: string;
  icon: string;
  color: string;
  params: Record<string, any>;
}

export type GameState = 'SETUP' | 'HOME' | 'VIBES' | 'SWIPE' | 'SPIN' | 'WINNER';
