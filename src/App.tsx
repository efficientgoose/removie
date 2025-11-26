import { useEffect, useRef } from 'react';
import { useGameStore } from './store/useGameStore';
import { SwipeCard } from './components/SwipeCard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Film, Ghost, Laugh, Brain, RefreshCw, Play, Settings, X, Heart, User, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import ntflxBg from './assets/ntflx_bg.jpg';

// Vibe Configuration
const VIBES = [
  { id: "chill", label: "Comfort Food", color: "bg-blue-500", icon: Film, params: { with_genres: "16,10751", "vote_average.gte": 7 } },
  { id: "thrill", label: "On Edge", color: "bg-red-600", icon: Ghost, params: { with_genres: "53,27", "vote_average.gte": 6 } },
  { id: "laugh", label: "Brainless Fun", color: "bg-yellow-500", icon: Laugh, params: { with_genres: "35,28", with_runtime_lte: 100 } },
  { id: "learn", label: "Big Brain", color: "bg-green-600", icon: Brain, params: { with_genres: "99,36", "vote_count.gte": 500 } },
];

function App() {
  const store = useGameStore();
  
  // Ref for the active card to trigger animations (must be at top level)
  const activeCardRef = useRef<any>(null);

  // Auto-skip setup if API key exists
  useEffect(() => {
    if (store.apiKey && store.view === 'SETUP') {
      store.setView('HOME');
    }
  }, [store.apiKey, store.view, store.setView]);

  // Error Banner
  if (store.error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8 text-center text-white">
        <div className="max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-red-500/30 shadow-2xl">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Oops!</h2>
          <p className="text-zinc-300 mb-8">{store.error}</p>
          <button 
            onClick={() => store.setView('VIBES')}
            className="w-full py-4 bg-white/10 backdrop-blur-md rounded-xl font-bold hover:bg-white/20 transition border border-white/10"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Confetti Effect on Winner
  useEffect(() => {
    if (store.view === 'WINNER') {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [store.view]);

  // --- RENDER: SETUP ---
  if (store.view === 'SETUP') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            MovieMatch
          </h1>
          <input 
            type="text" 
            placeholder="TMDB API Key" 
            className="w-full bg-white/5 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onChange={(e) => store.setApiKey(e.target.value)}
          />
          <button 
            onClick={() => store.setApiKey(store.apiKey)}
            disabled={!store.apiKey}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-500 transition disabled:opacity-50"
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: LOADING ---
  if (store.isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- RENDER: HOME ---
  if (store.view === 'HOME') {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center overflow-hidden relative">
        {/* Netflix-style background with black overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={ntflxBg}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>
        </div>
        
        <div className="w-full max-w-md p-6 flex flex-col items-center justify-center relative z-10">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">MovieMatch</h1>
          <p className="text-zinc-400 mb-12 text-center">Choose your game mode</p>
          
          <div className="w-full space-y-4 mb-8">
            <button 
              onClick={() => store.setGameMode('SINGLE')}
              className="w-full p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 hover:scale-105 transition shadow-2xl flex items-center justify-center gap-3"
            >
              <User size={24} />
              <span className="text-xl font-bold">Single Player</span>
            </button>
            
            <button 
              onClick={() => store.setGameMode('MULTI')}
              className="w-full p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 hover:scale-105 transition shadow-2xl flex items-center justify-center gap-3"
            >
              <Users size={24} />
              <span className="text-xl font-bold">Multiplayer</span>
            </button>
          </div>

          <button 
            onClick={() => store.setView('SETUP')}
            className="text-zinc-500 hover:text-zinc-300 text-sm transition flex items-center gap-2"
          >
            <Settings size={16} /> Change API Key
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: VIBES ---
  if (store.view === 'VIBES') {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-950 via-zinc-950 to-purple-950 text-white flex items-center justify-center overflow-hidden relative">
        {/* Ambient gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="w-full max-w-md p-6 flex flex-col h-full relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Select Vibe</h1>
            <button onClick={() => store.setApiKey("")}><Settings className="text-zinc-600" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1 content-start">
            {VIBES.map((vibe) => (
              <button
                key={vibe.id}
                onClick={() => store.loadMovies(vibe.params)}
                className="aspect-square bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition active:scale-95 shadow-xl"
              >
                <div className={`w-12 h-12 rounded-full ${vibe.color} flex items-center justify-center`}>
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

  // --- RENDER: SWIPE ---
  if (store.view === 'SWIPE') {
    const movie = store.movies[store.currentIndex];
    const nextMovie = store.movies[store.currentIndex + 1];

    const handleSwipe = async (dir: 'left' | 'right') => {
      if (activeCardRef.current) {
        await activeCardRef.current.swipe(dir);
      }
    };

    console.log("RENDER SWIPE:", { 
      movie, 
      nextMovie, 
      currentIndex: store.currentIndex, 
      total: store.movies.length 
    });

    if (!movie) {
      console.error("NO MOVIE FOUND BUT VIEW IS SWIPE");
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8 text-center text-white">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4">No movies found!</h2>
            <p className="text-zinc-400 mb-8">Try selecting a different vibe.</p>
            <button 
              onClick={() => store.setView('VIBES')}
              className="px-8 py-4 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 transition"
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
            
            <ErrorBoundary>
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
            </ErrorBoundary>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-8 pb-8">
            <button onClick={() => handleSwipe('left')} className="p-4 bg-white/10 backdrop-blur-md rounded-full text-red-500 border border-white/20 hover:scale-110 hover:bg-white/20 transition shadow-xl"><X size={32} /></button>
            <button onClick={() => handleSwipe('right')} className="p-4 bg-white/10 backdrop-blur-md rounded-full text-green-500 border border-white/20 hover:scale-110 hover:bg-white/20 transition shadow-xl"><Heart size={32} fill="currentColor" /></button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: WINNER ---
  if (store.view === 'WINNER' && store.winner) {
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
              className="w-64 rounded-xl shadow-2xl mb-8 border-2 border-white/10"
            />
            <h1 className="text-3xl font-black mb-4">{store.winner.title}</h1>
            <p className="text-zinc-400 text-sm line-clamp-3 mb-8">{store.winner.overview}</p>
            
            <div className="w-full space-y-3">
              <a 
                href={`https://www.themoviedb.org/movie/${store.winner.id}/watch`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-purple-600/80 backdrop-blur-md text-white rounded-xl font-bold hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400 transition shadow-xl"
                aria-label={`Watch ${store.winner.title} now`}
              >
                <Play size={20} aria-hidden="true" /> Watch Now
              </a>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={store.spinWheel} className="py-3 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition flex items-center justify-center gap-2 border border-white/10 shadow-lg" aria-label="Spin the wheel again"><RefreshCw size={18} aria-hidden="true"/> Spin Again</button>
                <button onClick={store.resetGame} className="py-3 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition border border-white/10 shadow-lg" aria-label="Reset and start over">Reset</button>
          </div>
          </div>
        </div>
      </div>
      </div>
    );
  }

  // Fallback for Spin state
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8 text-center">
      <div className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Ready?</h2>
        <p className="text-zinc-400 mb-8">We found {store.liked.length} candidates.</p>
        <button 
          onClick={store.spinWheel}
          className="w-full py-6 bg-white text-black text-2xl font-black rounded-2xl hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/50 transition shadow-xl shadow-white/10"
          aria-label="Spin the wheel to select your movie"
        >
          SPIN THE WHEEL
        </button>
      </div>
    </div>
  );
}

export default App;