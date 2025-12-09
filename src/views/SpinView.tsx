import { useGameStore } from '../store/useGameStore';

export function SpinView() {
  const store = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-2xl relative z-10">
        <h2 className="text-3xl font-bold text-white mb-2">Ready?</h2>
        <p className="text-zinc-400 mb-8">We found {store.liked.length} candidates.</p>
        <button
          onClick={store.spinWheel}
          className="w-full py-8 bg-gradient-to-b from-white via-white to-zinc-100 text-black text-2xl font-black rounded-3xl hover:from-zinc-50 hover:to-zinc-200 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-[0_2px_0_0_rgba(0,0,0,0.1)_inset,0_16px_48px_rgba(255,255,255,0.2)] active:scale-[0.98]"
          aria-label="Spin the wheel to select your movie"
        >
          SPIN THE WHEEL
        </button>
      </div>
    </div>
  );
}