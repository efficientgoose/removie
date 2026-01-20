import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
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

  // Enhanced rotation with more dynamic range
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Visual Feedback - more gradual appearance with scale
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const likeScale = useTransform(x, [0, 100], [0.8, 1.1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const nopeScale = useTransform(x, [-100, 0], [1.1, 0.8]);

  useImperativeHandle(ref, () => ({
    swipe: async (dir) => {
      const targetX = dir === 'right' ? 600 : -600;
      const targetRotate = dir === 'right' ? 30 : -30;
      await controls.start({
        x: targetX,
        rotate: targetRotate,
        opacity: 0,
        transition: {
          duration: 0.4,
          ease: [0.32, 0.72, 0, 1]
        }
      });
      onSwipe(dir);
    }
  }));

  const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      await controls.start({
        x: 600,
        rotate: 30,
        opacity: 0,
        transition: {
          duration: 0.3,
          ease: [0.32, 0.72, 0, 1]
        }
      });
      onSwipe('right');
    } else if (offset < -100 || velocity < -500) {
      await controls.start({
        x: -600,
        rotate: -30,
        opacity: 0,
        transition: {
          duration: 0.3,
          ease: [0.32, 0.72, 0, 1]
        }
      });
      onSwipe('left');
    } else {
      controls.start({
        x: 0,
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8
        }
      });
    }
  };

  useEffect(() => {
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
      <div className="relative w-full h-full bg-zinc-900/90 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_16px_64px_rgba(0,0,0,0.6)] border border-white/[0.08] cursor-grab active:cursor-grabbing">
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* EMOJI OVERLAYS - enhanced with scale animation */}
        <motion.div
          style={{ opacity: likeOpacity, scale: likeScale }}
          className="absolute top-8 right-8 transform rotate-12 origin-center"
        >
          <span className="text-8xl filter drop-shadow-[0_4px_20px_rgba(0,0,0,1)] drop-shadow-[0_0_40px_rgba(34,197,94,0.6)]">
            😍
          </span>
        </motion.div>
        <motion.div
          style={{ opacity: nopeOpacity, scale: nopeScale }}
          className="absolute top-8 left-8 transform -rotate-12 origin-center"
        >
          <span className="text-8xl filter drop-shadow-[0_4px_20px_rgba(0,0,0,1)] drop-shadow-[0_0_40px_rgba(239,68,68,0.6)]">
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