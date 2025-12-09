import { Film, Ghost, Laugh, Brain } from 'lucide-react';

export interface VibeConfig {
  id: string;
  label: string;
  color: string;
  icon: typeof Film;
  params: Record<string, any>;
}

export const VIBES: VibeConfig[] = [
  {
    id: "chill",
    label: "Comfort Food",
    color: "bg-blue-500",
    icon: Film,
    params: { with_genres: "16,10751", "vote_average.gte": 7 }
  },
  {
    id: "thrill",
    label: "On Edge",
    color: "bg-red-600",
    icon: Ghost,
    params: { with_genres: "53,27", "vote_average.gte": 6 }
  },
  {
    id: "laugh",
    label: "Brainless Fun",
    color: "bg-yellow-500",
    icon: Laugh,
    params: { with_genres: "35,28", with_runtime_lte: 100 }
  },
  {
    id: "learn",
    label: "Big Brain",
    color: "bg-green-600",
    icon: Brain,
    params: { with_genres: "99,36", "vote_count.gte": 500 }
  },
];