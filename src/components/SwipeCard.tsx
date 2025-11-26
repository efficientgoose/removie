import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import type { Movie } from '../types';
import { forwardRef, useImperativeHandle, useEffect } from 'react';

interface Props {
  movie: Movie;
  onSwipe: (dir: 'left' | 'right') => void;
  index: number;
}

export interface SwipeCardRef {
  swipe: (dir: 'left' | 'right') => Promise<void>;
}

export const SwipeCard = forwardRef<SwipeCardRef, Props>(({ movie, onSwipe, index }, ref) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  // Visual Feedback - appear quicker
  const likeOpacity = useTransform(x, [10, 60], [0, 1]);
  const nopeOpacity = useTransform(x, [-10, -60], [0, 1]);

  useImperativeHandle(ref, () => ({
    swipe: async (dir) => {
      const targetX = dir === 'right' ? 500 : -500;
      await controls.start({ x: targetX, transition: { duration: 0.3 } });
      onSwipe(dir);
    }
  }));

  const handleDragEnd = async (_: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      await controls.start({ x: 500, transition: { duration: 0.2 } });
      onSwipe('right');
    } else if (offset < -100 || velocity < -500) {
      await controls.start({ x: -500, transition: { duration: 0.2 } });
      onSwipe('left');
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  useEffect(() => {
    console.log("SwipeCard MOUNTED", { index, movie: movie.title });
    controls.start({ scale: 1, y: 0, opacity: 1 });
  }, [controls, index, movie.title]);

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: 100 - index }}
      animate={controls}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 w-full h-full origin-bottom"
      initial={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full h-full bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 cursor-grab active:cursor-grabbing">
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* EMOJI OVERLAYS - text-8xl, appear quicker */}
        <motion.div 
          style={{ opacity: likeOpacity }} 
          className="absolute top-8 right-8 transform rotate-12"
        >
          <span className="text-8xl filter drop-shadow-[0_4px_20px_rgba(0,0,0,1)] drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">
            😍
          </span>
        </motion.div>
        <motion.div 
          style={{ opacity: nopeOpacity }} 
          className="absolute top-8 left-8 transform -rotate-12"
        >
          <span className="text-8xl filter drop-shadow-[0_4px_20px_rgba(0,0,0,1)] drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">
            😴
          </span>
        </motion.div>

        {/* INFO */}
        <div className="absolute bottom-0 w-full p-6 pb-24 pointer-events-none">
          <h2 className="text-4xl font-black text-white drop-shadow-lg">{movie.title}</h2>
          <div className="flex items-center gap-2 mt-2 mb-4">
            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
              ★ {movie.vote_average.toFixed(1)}
            </span>
            <span className="text-white/80 text-sm">
              {movie.release_date.split('-')[0]}
            </span>
          </div>
          <p className="text-white/80 line-clamp-3 text-sm">{movie.overview}</p>
        </div>
      </div>
    </motion.div>
  );
});