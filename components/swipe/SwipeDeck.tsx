import { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { Swiper, type SwiperCardRefType } from "rn-swiper-list";

import { triggerSwipeHaptic } from "../../utils/haptics";
import type { SwipeResult, SwipeableMovie } from "../../types";
import { SwipeCard } from "./SwipeCard";

const SWIPE_RANGE = Dimensions.get("window").width / 6;

function getPosterUri(posterPath: string | null): string | null {
  if (!posterPath) return null;
  if (posterPath.startsWith("http")) return posterPath;
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

interface StackCardProps {
  movie: SwipeableMovie | undefined;
  layer: 1 | 2 | 3;
}

function StackCard({ movie, layer }: StackCardProps) {
  const layerStyle = layer === 1 ? styles.stackLayer1 : layer === 2 ? styles.stackLayer2 : styles.stackLayer3;
  const posterUri = movie ? getPosterUri(movie.posterPath) : null;

  return (
    <View pointerEvents="none" style={[styles.stackLayer, layerStyle]}>
      {posterUri ? (
        <Image source={{ uri: posterUri }} style={styles.stackPoster} resizeMode="cover" />
      ) : null}
      <View style={styles.stackShade} />
    </View>
  );
}

interface SwipeDeckProps {
  movies: SwipeableMovie[];
  onSwipe: (movie: SwipeableMovie, result: SwipeResult) => void;
  onComplete?: () => void;
}

export function SwipeDeck({ movies, onSwipe, onComplete }: SwipeDeckProps) {
  const swiperRef = useRef<SwiperCardRefType>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Stabilize the data reference so Swiper doesn't reset on store updates.
  const moviesRef = useRef(movies);
  const stableMovies = useMemo(() => {
    const prevIds = moviesRef.current.map((m) => `${m.mediaType}-${m.id}`).join(",");
    const nextIds = movies.map((m) => `${m.mediaType}-${m.id}`).join(",");
    if (prevIds !== nextIds) {
      moviesRef.current = movies;
    }
    return moviesRef.current;
  }, [movies]);

  const handleSwipeRight = useCallback(
    (index: number) => {
      void triggerSwipeHaptic("like");
      onSwipe(stableMovies[index], "like");
    },
    [stableMovies, onSwipe],
  );

  const handleSwipeLeft = useCallback(
    (index: number) => {
      void triggerSwipeHaptic("dislike");
      onSwipe(stableMovies[index], "dislike");
    },
    [stableMovies, onSwipe],
  );

  const handleSwipeEnd = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const handleIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const renderCard = useCallback(
    (movie: SwipeableMovie) => <SwipeCard movie={movie} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: SwipeableMovie) => `${item.mediaType}-${item.id}`,
    [],
  );

  if (!stableMovies.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No movies in this deck yet.</Text>
      </View>
    );
  }

  const progressText = `${Math.min(activeIndex + 1, stableMovies.length)}/${stableMovies.length}`;

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{progressText}</Text>
        </View>
      </View>

      <View style={styles.deckArea}>
        {/* Decorative stack layers - pointerEvents none so they don't block swipes */}
        {activeIndex < stableMovies.length ? (
          <View pointerEvents="none" style={styles.stackContainer}>
            {stableMovies[activeIndex + 3] ? <StackCard movie={stableMovies[activeIndex + 3]} layer={3} /> : null}
            {stableMovies[activeIndex + 2] ? <StackCard movie={stableMovies[activeIndex + 2]} layer={2} /> : null}
            {stableMovies[activeIndex + 1] ? <StackCard movie={stableMovies[activeIndex + 1]} layer={1} /> : null}
          </View>
        ) : null}

        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            data={stableMovies}
            renderCard={renderCard}
            keyExtractor={keyExtractor}
            cardStyle={styles.card}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onSwipedAll={handleSwipeEnd}
            onIndexChange={handleIndexChange}
            disableTopSwipe
            translateXRange={[-SWIPE_RANGE, 0, SWIPE_RANGE]}
            overlayLabelContainerStyle={styles.overlayContainer}
            OverlayLabelRight={() => (
              <View style={styles.likeOverlay}>
                <Text style={styles.likeText}>LIKE</Text>
              </View>
            )}
            OverlayLabelLeft={() => (
              <View style={styles.dislikeOverlay}>
                <Text style={styles.dislikeText}>NOPE</Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deckArea: {
    flex: 1,
    paddingHorizontal: 4,
  },
  stackContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -10,
  },
  swiperContainer: {
    flex: 1,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
  },
  overlayContainer: {
    borderRadius: 24,
    overflow: "hidden",
  },
  stackLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#3F3F46",
    backgroundColor: "#18181B",
  },
  stackPoster: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  stackShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9, 9, 11, 0.35)",
  },
  stackLayer1: {
    transform: [{ scale: 0.92 }, { translateX: 26 }, { rotate: "5deg" }],
    opacity: 0.8,
  },
  stackLayer2: {
    transform: [{ scale: 0.92 }, { translateX: -26 }, { rotate: "-5deg" }],
    opacity: 0.8,
  },
  stackLayer3: {
    transform: [{ scale: 0.86 }, { translateY: 10 }],
    opacity: 0.45,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#27272A",
    backgroundColor: "#18181B",
  },
  emptyTitle: {
    color: "#D4D4D8",
    fontSize: 16,
  },
  progressRow: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  progressBadge: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#3F3F46",
    backgroundColor: "#18181B",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  progressText: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "600",
  },
  likeOverlay: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "rgba(34, 197, 94, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  dislikeOverlay: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "rgba(239, 68, 68, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  likeText: {
    color: "#6EE7B7",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 2,
  },
  dislikeText: {
    color: "#FCA5A5",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
