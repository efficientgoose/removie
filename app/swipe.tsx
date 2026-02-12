import { router } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SwipeDeck } from "../components/swipe/SwipeDeck";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { GENRE_OPTIONS } from "../constants/genres";
import { LANGUAGE_CODE_TO_LABEL } from "../constants/languages";
import { useMovieRecommendations } from "../hooks/useMovieRecommendations";
import { useSessionStore } from "../stores/sessionStore";
import type { SwipeResult, SwipeableMovie } from "../types";
import { triggerErrorHaptic, triggerSelectionHaptic, triggerSuccessHaptic } from "../utils/haptics";

function toGenreLabels(slugs: string[]): string {
  if (slugs.length === 0) {
    return "Any";
  }

  return slugs
    .map((slug) => GENRE_OPTIONS.find((genre) => genre.slug === slug)?.label ?? slug)
    .join(", ");
}

export default function SwipeScreen() {
  const filters = useSessionStore((state) => state.filters);
  const likedMovies = useSessionStore((state) => state.likedMovies);
  const dislikedMovies = useSessionStore((state) => state.dislikedMovies);
  const markSwipe = useSessionStore((state) => state.markSwipe);
  const swipedCount = useSessionStore((state) => state.initialMovies.filter((m) => m.swiped).length);
  const totalMovies = useSessionStore((state) => state.initialMovies.length);

  const {
    initialMovies,
    loading,
    error,
    fetchInitialMovies,
    fetchFinalRecommendation,
  } = useMovieRecommendations();

  const languageText =
    filters.languages.length > 0
      ? filters.languages.map((code) => LANGUAGE_CODE_TO_LABEL[code] ?? code).join(", ")
      : "Any";
  const genreText = useMemo(() => toGenreLabels(filters.genres), [filters.genres]);

  const filtersKey = useMemo(
    () =>
      JSON.stringify({
        contentType: filters.contentType,
        languages: [...filters.languages].sort(),
        genres: [...filters.genres].sort(),
        yearRange: filters.yearRange,
        vibeDescription: filters.vibeDescription?.trim() ?? "",
      }),
    [filters],
  );

  const loadDeck = useCallback(async () => {
    await fetchInitialMovies(filters);
  }, [fetchInitialMovies, filters]);

  const handleReloadDeckPress = useCallback(async () => {
    void triggerSelectionHaptic();
    await loadDeck();
  }, [loadDeck]);

  useEffect(() => {
    if (initialMovies.length > 0) {
      return;
    }

    void loadDeck();
  }, [filtersKey, initialMovies.length, loadDeck]);

  const handleSwipe = useCallback(
    (movie: SwipeableMovie, result: SwipeResult) => {
      markSwipe(movie.id, movie.mediaType, result);
    },
    [markSwipe],
  );

  const completed = totalMovies > 0 && swipedCount >= totalMovies;
  const deckLoadError = initialMovies.length === 0 ? error : null;
  const actionError = initialMovies.length > 0 ? error : null;

  const handleSeeResult = useCallback(async () => {
    void triggerSelectionHaptic();
    const recommendation = await fetchFinalRecommendation(likedMovies, dislikedMovies);
    if (!recommendation) {
      void triggerErrorHaptic();
      return;
    }

    void triggerSuccessHaptic();
    router.push("/result");
  }, [dislikedMovies, fetchFinalRecommendation, likedMovies]);

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="px-6 pb-2 pt-4">
        <Text className="text-3xl font-bold text-white">Swipe Picks</Text>
        <Text className="mt-2 text-sm text-zinc-300">
          Type: {filters.contentType} · Languages: {languageText}
        </Text>
        <Text className="mt-1 text-sm text-zinc-300">
          Genres: {genreText} · Year: {filters.yearRange}
        </Text>
      </View>

      <View className="flex-1 px-6 pb-3 pt-2">
        {loading && initialMovies.length === 0 ? (
          <View className="flex-1 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <View className="mb-4 flex-row justify-end">
              <Skeleton height={24} width={56} borderRadius={999} />
            </View>
            <Skeleton height={380} borderRadius={24} />
            <Skeleton height={16} width="62%" style={{ marginTop: 16 }} />
            <Skeleton height={14} width="46%" style={{ marginTop: 10 }} />
            <Text className="mt-5 text-sm text-zinc-400">Building your deck...</Text>
          </View>
        ) : null}

        {!loading && deckLoadError ? (
          <View className="flex-1 items-center justify-center rounded-3xl border border-red-500/50 bg-zinc-900 px-6">
            <Text className="text-center text-lg font-semibold text-red-300">Could not load recommendations</Text>
            <Text className="mt-3 text-center text-sm text-zinc-300">{deckLoadError}</Text>
            <View className="mt-6 w-full">
              <Button label="Retry" onPress={handleReloadDeckPress} />
            </View>
          </View>
        ) : null}

        {initialMovies.length > 0 ? (
          <SwipeDeck movies={initialMovies} onComplete={() => void triggerSuccessHaptic()} onSwipe={handleSwipe} />
        ) : null}
      </View>

      <View className="px-6 pb-8 pt-2">
        <Text className="mb-3 text-sm text-zinc-300">
          Progress: {swipedCount}/{totalMovies} · Likes: {likedMovies.length} · Dislikes: {dislikedMovies.length}
        </Text>

        <View className="flex-row">
          <View className="mr-3 flex-1">
            <Button label="Reload Deck" variant="secondary" onPress={handleReloadDeckPress} />
          </View>
          <View className="flex-1">
            <Button label="See Result" disabled={!completed || loading} onPress={handleSeeResult} />
          </View>
        </View>

        {actionError ? <Text className="mt-3 text-sm text-red-300">{actionError}</Text> : null}
      </View>
    </SafeAreaView>
  );
}
