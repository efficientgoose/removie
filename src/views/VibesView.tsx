import { useGameStore } from '../store/useGameStore';
import { Settings } from 'lucide-react';
import { VIBES } from '../config/vibes';

export function VibesView() {
  const store = useGameStore();

  return (
    <div className="h-screen bg-gradient-to-br from-blue-950 via-zinc-950 to-purple-950 text-white flex items-center justify-center overflow-hidden relative">
      {/* Ambient gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="w-full max-w-md p-6 flex flex-col h-full relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Select Vibe</h1>
          <button
            onClick={() => store.setApiKey("")}
            className="p-2 hover:bg-white/[0.08] rounded-lg transition-all"
          >
            <Settings className="text-zinc-400 hover:text-zinc-200 transition-colors" size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 flex-1 content-start">
          {VIBES.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => store.loadMovies(vibe.params)}
              className="aspect-square bg-white/[0.08] backdrop-blur-3xl rounded-3xl border border-white/[0.12] flex flex-col items-center justify-center gap-4 hover:bg-white/[0.12] hover:scale-[1.02] transition-all active:scale-95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)]"
            >
              <div className={`w-12 h-12 rounded-full ${vibe.color} flex items-center justify-center shadow-lg`}>
                <vibe.icon className="text-white w-6 h-6" />
              </div>
              <span className="font-bold">{vibe.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}