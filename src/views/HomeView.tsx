import { useGameStore } from '../store/useGameStore';
import { Settings, User, Users } from 'lucide-react';
import ntflxBgUs from '../assets/ntflx_bg_usa.jpg';

export function HomeView() {
  const store = useGameStore();

  return (
    <div className="h-screen bg-black text-white flex items-center justify-center overflow-hidden relative">
      {/* Netflix-style background with black overlay */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <div className="absolute inset-0 flex animate-[scroll_30s_linear_infinite] w-[200%]">
          <img
            src={ntflxBgUs}
            alt=""
            className="h-full w-1/2 object-cover opacity-60 flex-shrink-0"
          />
          <img
            src={ntflxBgUs}
            alt=""
            className="h-full w-1/2 object-cover opacity-60 flex-shrink-0"
          />
        </div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>
      </div>

      <div className="w-full max-w-md p-6 flex flex-col items-center justify-center relative z-10">
        {/* Colorful gradient orbs behind the card for glass effect */}
        <div className="absolute w-64 h-64 bg-purple-500/30 rounded-full blur-3xl -translate-y-20"></div>
        <div className="absolute w-48 h-48 bg-pink-500/30 rounded-full blur-3xl translate-y-32 translate-x-20"></div>

        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent relative z-10">MovieMatch</h1>
        <p className="text-zinc-400 mb-12 text-center relative z-10">Choose your game mode</p>

        <div className="w-full space-y-4 mb-8 relative z-10">
          <button
            onClick={() => store.setGameMode('SINGLE')}
            className="w-full p-6 bg-white/[0.15] backdrop-blur-2xl rounded-2xl border border-white/[0.2] hover:bg-white/[0.25] hover:scale-[1.02] transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.4)] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <User size={24} />
            <span className="text-xl font-bold">Single Player</span>
          </button>

          <button
            onClick={() => store.setGameMode('MULTI')}
            className="w-full p-6 bg-white/[0.15] backdrop-blur-2xl rounded-2xl border border-white/[0.2] hover:bg-white/[0.25] hover:scale-[1.02] transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.4)] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Users size={24} />
            <span className="text-xl font-bold">Multiplayer</span>
          </button>
        </div>

        <button
          onClick={() => store.setView('SETUP')}
          className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/[0.1] backdrop-blur-xl relative z-10"
        >
          <Settings size={16} /> Change API Key
        </button>
      </div>
    </div>
  );
}