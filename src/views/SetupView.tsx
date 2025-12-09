import { useGameStore } from '../store/useGameStore';

export function SetupView() {
  const store = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md space-y-8 text-center relative z-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          MovieMatch
        </h1>
        <input
          type="text"
          placeholder="TMDB API Key"
          className="w-full bg-white/[0.08] backdrop-blur-3xl border border-white/[0.12] rounded-2xl p-5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-white/[0.18] transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          onChange={(e) => store.setApiKey(e.target.value)}
        />
        <button
          onClick={() => store.setApiKey(store.apiKey)}
          disabled={!store.apiKey}
          className="w-full bg-gradient-to-b from-purple-600 to-purple-700 text-white font-bold py-5 rounded-2xl hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_8px_24px_rgba(147,51,234,0.3)] active:scale-[0.98]"
        >
          Start
        </button>
      </div>
    </div>
  );
}