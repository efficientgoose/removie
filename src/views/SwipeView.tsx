import { useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { SwipeCard } from '../components/SwipeCard';
import type { SwipeCardRef } from '../components/SwipeCard';
import { X, Heart } from 'lucide-react';

export function SwipeView() {
  const store = useGameStore();
  const activeCardRef = useRef<SwipeCardRef>(null);

  const movie = store.movies[store.currentIndex];
  const nextMovie = store.movies[store.currentIndex + 1];

  const handleSwipe = async (dir: 'left' | 'right') => {
    if (activeCardRef.current) {
      await activeCardRef.current.swipe(dir);
    }
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-8 text-center text-white">
        <div className="max-w-md bg-white/[0.08] backdrop-blur-3xl border border-white/[0.12] rounded-3xl p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_16px_48px_rgba(0,0,0,0.5)]">
          <h2 className="text-2xl font-bold mb-4">No movies found!</h2>
          <p className="text-zinc-400 mb-8">Try selecting a different vibe.</p>
          <button
            onClick={() => store.setView('VIBES')}
            className="px-8 py-4 bg-gradient-to-b from-purple-600 to-purple-700 rounded-2xl font-bold hover:from-purple-500 hover:to-purple-600 transition-all shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_8px_24px_rgba(147,51,234,0.3)] active:scale-[0.98]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center overflow-hidden relative">
      <div className="w-full max-w-md h-full p-4 flex flex-col relative z-10">
        {/* Progress Bar */}
        <div className="h-1 bg-zinc-800 w-full mb-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all duration-300"
            style={{ width: `${((store.currentIndex) / 10) * 100}%` }}
          />
        </div>

        <div className="flex-1 relative mb-4 perspective-1000">
          {/* Ambient glow from current movie - positioned behind cards */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt=""
              className="w-full aspect-[2/3] object-cover blur-[80px] opacity-70 scale-125"
            />
          </div>

            {/* Next Card (Background) */}
            {nextMovie && (
              <div className="absolute inset-0 transform scale-95 opacity-50 translate-y-4">
                <SwipeCard
                  key={nextMovie.id}
                  movie={nextMovie}
                  onSwipe={() => {}}
                  index={1}
                />
              </div>
            )}

            {/* Active Card */}
            <SwipeCard
              ref={activeCardRef}
              key={movie.id}
              movie={movie}
              onSwipe={store.swipe}
              index={0}
            />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-8 pb-8">
          <button onClick={() => handleSwipe('left')} className="p-5 bg-white/[0.08] backdrop-blur-3xl rounded-full text-red-500 border border-white/[0.12] hover:scale-110 hover:bg-white/[0.12] transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.4)] active:scale-95"><X size={32} /></button>
          <button onClick={() => handleSwipe('right')} className="p-5 bg-white/[0.08] backdrop-blur-3xl rounded-full text-green-500 border border-white/[0.12] hover:scale-110 hover:bg-white/[0.12] transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.4)] active:scale-95"><Heart size={32} fill="currentColor" /></button>
        </div>
      </div>
    </div>
  );
}