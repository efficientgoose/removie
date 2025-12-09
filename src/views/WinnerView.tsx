import { useGameStore } from '../store/useGameStore';
import { RefreshCw, Play } from 'lucide-react';

export function WinnerView() {
  const store = useGameStore();

  if (!store.winner) return null;

  return (
    <div className="h-screen bg-zinc-950 text-white flex items-center justify-center overflow-hidden relative">
      {/* Full-screen movie poster background - blurred and translucent */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={`https://image.tmdb.org/t/p/original${store.winner.poster_path}`}
          alt=""
          className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
        />
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-md p-6 flex flex-col items-center justify-center text-center relative z-10">
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-6">Tonight's Pick</div>
          <img
            src={`https://image.tmdb.org/t/p/w500${store.winner.poster_path}`}
            className="w-64 rounded-3xl shadow-[0_16px_64px_rgba(0,0,0,0.6)] mb-8 border border-white/[0.12]"
          />
          <h1 className="text-3xl font-black mb-4">{store.winner.title}</h1>
          <p className="text-zinc-400 text-sm line-clamp-3 mb-8">{store.winner.overview}</p>

          <div className="w-full space-y-3">
            <a
              href={`https://www.themoviedb.org/movie/${store.winner.id}/watch`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-5 bg-gradient-to-b from-purple-600 to-purple-700 backdrop-blur-3xl text-white rounded-2xl font-bold hover:from-purple-500 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-400/50 transition-all shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_16px_48px_rgba(147,51,234,0.4)] active:scale-[0.98]"
              aria-label={`Watch ${store.winner.title} now`}
            >
              <Play size={20} aria-hidden="true" /> Watch Now
            </a>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={store.spinWheel} className="py-4 bg-white/[0.08] backdrop-blur-3xl text-white rounded-2xl font-bold hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-zinc-500/50 transition-all flex items-center justify-center gap-2 border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)] active:scale-[0.98]" aria-label="Spin the wheel again"><RefreshCw size={18} aria-hidden="true"/> Spin Again</button>
              <button onClick={store.resetGame} className="py-4 bg-white/[0.08] backdrop-blur-3xl text-white rounded-2xl font-bold hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-zinc-500/50 transition-all border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)] active:scale-[0.98]" aria-label="Reset and start over">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}