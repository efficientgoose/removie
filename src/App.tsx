import { useEffect, useRef } from 'react';
import { useGameStore } from './store/useGameStore';
import confetti from 'canvas-confetti';

// Views
import { SetupView } from './views/SetupView';
import { HomeView } from './views/HomeView';
import { VibesView } from './views/VibesView';
import { SwipeView } from './views/SwipeView';
import { SpinView } from './views/SpinView';
import { WinnerView } from './views/WinnerView';

function App() {
  const store = useGameStore();
  const confettiShownRef = useRef(false);

  // Auto-skip setup if API key exists
  useEffect(() => {
    if (store.apiKey && store.view === 'SETUP') {
      store.setView('HOME');
    }
  }, [store.apiKey, store.view, store.setView]);

  // Confetti Effect on Winner (prevent re-firing)
  useEffect(() => {
    if (store.view === 'WINNER' && !confettiShownRef.current) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      confettiShownRef.current = true;
    } else if (store.view !== 'WINNER') {
      confettiShownRef.current = false;
    }
  }, [store.view]);

  // Error Banner
  if (store.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-8 text-center text-white relative overflow-hidden">
        {/* Ambient gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-md bg-white/[0.08] backdrop-blur-3xl p-8 rounded-3xl border border-red-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_16px_48px_rgba(0,0,0,0.5)] relative z-10">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Oops!</h2>
          <p className="text-zinc-300 mb-8">{store.error}</p>
          <button
            onClick={() => {
              store.setView('VIBES');
              useGameStore.setState({ error: null });
            }}
            className="w-full py-4 bg-white/[0.08] backdrop-blur-3xl rounded-2xl font-bold hover:bg-white/[0.12] transition-all border border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)] active:scale-[0.98]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading State
  if (store.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden">
        {/* Ambient gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>

        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin relative z-10" />
      </div>
    );
  }

  // View Router
  return (
    <>
      {store.view === 'SETUP' && <SetupView />}
      {store.view === 'HOME' && <HomeView />}
      {store.view === 'VIBES' && <VibesView />}
      {store.view === 'SWIPE' && <SwipeView />}
      {store.view === 'SPIN' && <SpinView />}
      {store.view === 'WINNER' && <WinnerView />}
    </>
  );
}

export default App;