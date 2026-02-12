import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { getGenreLabelById } from "../constants/genres";
import { useMovieRecommendations } from "../hooks/useMovieRecommendations";
import { getTMDBImageUrl, getWatchProviders } from "../services/tmdb";
import { useSessionStore } from "../stores/sessionStore";
import { triggerErrorHaptic, triggerSelectionHaptic, triggerSuccessHaptic } from "../utils/haptics";

export default function ResultScreen() {
  const finalRecommendation = useSessionStore((state) => state.finalRecommendation);
  const recommendationReason = useSessionStore((state) => state.recommendationReason);
  const likedMovies = useSessionStore((state) => state.likedMovies);
  const dislikedMovies = useSessionStore((state) => state.dislikedMovies);
  const resetSession = useSessionStore((state) => state.resetSession);

  const { fetchFinalRecommendation, loading, error } = useMovieRecommendations();

  const [rejectedTitles, setRejectedTitles] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [isFindingRunnerUp, setIsFindingRunnerUp] = useState(false);

  const reveal = useSharedValue(0);

  const revealStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ scale: interpolate(reveal.value, [0, 1], [0.97, 1]) }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: interpolate(reveal.value, [0, 1], [-8, 0]) }],
  }));

  useEffect(() => {
    reveal.value = 0;
    reveal.value = withTiming(1, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [finalRecommendation?.id, reveal]);

  useEffect(() => {
    let active = true;

    async function loadProviders() {
      if (!finalRecommendation) {
        setProviders([]);
        setProvidersError(null);
        return;
      }

      setProvidersLoading(true);
      setProvidersError(null);

      try {
        const data = await getWatchProviders(finalRecommendation.mediaType, finalRecommendation.id, "US");
        if (!active) {
          return;
        }

        setProviders(data);
      } catch (err) {
        if (!active) {
          return;
        }

        const message = err instanceof Error ? err.message : "Failed to fetch watch providers.";
        setProvidersError(message);
        setProviders([]);
      } finally {
        if (active) {
          setProvidersLoading(false);
        }
      }
    }

    void loadProviders();

    return () => {
      active = false;
    };
  }, [finalRecommendation]);

  const handleEndSession = useCallback(() => {
    void triggerSuccessHaptic();
    resetSession(false);
    router.replace("/");
  }, [resetSession]);

  const handleFindRunnerUp = useCallback(async () => {
    if (!finalRecommendation) {
      return;
    }

    void triggerSelectionHaptic();
    setIsFindingRunnerUp(true);

    const nextExcluded = [...new Set([...rejectedTitles, finalRecommendation.title])];
    const nextRecommendation = await fetchFinalRecommendation(likedMovies, dislikedMovies, {
      excludedTitles: nextExcluded,
      preserveCurrentOnError: true,
    });

    if (nextRecommendation) {
      setRejectedTitles(nextExcluded);
      void triggerSuccessHaptic();
    } else {
      void triggerErrorHaptic();
    }

    setIsFindingRunnerUp(false);
  }, [dislikedMovies, fetchFinalRecommendation, finalRecommendation, likedMovies, rejectedTitles]);

  const heroBackdropUri = useMemo(() => {
    if (!finalRecommendation) {
      return null;
    }

    return (
      getTMDBImageUrl(finalRecommendation.backdropPath, "original") ??
      getTMDBImageUrl(finalRecommendation.posterPath, "w500")
    );
  }, [finalRecommendation]);

  if (!finalRecommendation) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 px-6 pb-8 pt-6">
        <View className="flex-1 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900 px-6">
          <Text className="text-center text-2xl font-bold text-zinc-100">No Recommendation Yet</Text>
          <Text className="mt-3 text-center text-sm text-zinc-300">
            Swipe through your deck first, then we will pick a final title.
          </Text>
          <View className="mt-8 w-full">
            <Button label="Back To Swipe" onPress={() => router.replace("/swipe")} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const year = finalRecommendation.releaseDate.slice(0, 4) || "N/A";
  const genreTags = finalRecommendation.genreIds.slice(0, 3).map((id) => getGenreLabelById(id));

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        <Animated.View style={revealStyle}>
          <View className="mx-6 mt-4 overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900">
            {heroBackdropUri ? (
              <ImageBackground source={{ uri: heroBackdropUri }} blurRadius={18} className="h-72 w-full">
                <View className="h-full w-full bg-black/55 px-5 pb-5 pt-6">
                  <Animated.View style={badgeStyle}>
                    <View className="self-start rounded-full border border-emerald-300/50 bg-emerald-500/20 px-3 py-1">
                      <Text className="text-xs font-semibold tracking-wide text-emerald-200">TOP PICK</Text>
                    </View>
                  </Animated.View>
                  <View className="flex-1 justify-end">
                    <Text className="text-3xl font-black text-white">{finalRecommendation.title}</Text>
                    <Text className="mt-2 text-sm text-zinc-200">
                      {year} · ⭐ {finalRecommendation.voteAverage.toFixed(1)}
                    </Text>
                    <View className="mt-3 flex-row flex-wrap">
                      {genreTags.map((genre, index) => (
                        <View
                          key={`${finalRecommendation.id}-${index}`}
                          className="mb-2 mr-2 rounded-full border border-white/30 bg-black/30 px-3 py-1"
                        >
                          <Text className="text-xs font-semibold text-zinc-100">{genre}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </ImageBackground>
            ) : (
              <View className="h-72 w-full bg-zinc-800" />
            )}
          </View>

          <View className="mx-6 mt-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <Text className="text-base font-semibold text-zinc-100">Synopsis</Text>
            <Text className="mt-2 text-sm leading-6 text-zinc-300">
              {finalRecommendation.overview || "No synopsis available."}
            </Text>
          </View>

          <View className="mx-6 mt-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <Text className="text-base font-semibold text-zinc-100">Why We Picked This</Text>
            <Text className="mt-2 text-sm leading-6 text-zinc-300">
              {recommendationReason?.trim() || "Based on your likes, this title best matched your watch profile."}
            </Text>
          </View>

          <View className="mx-6 mt-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <Text className="text-base font-semibold text-zinc-100">Where To Watch</Text>

            {providersLoading ? (
              <View className="mt-3">
                <Skeleton height={12} width={132} />
                <View className="mt-3 flex-row flex-wrap">
                  <Skeleton height={28} width={96} borderRadius={999} style={{ marginRight: 8, marginBottom: 8 }} />
                  <Skeleton height={28} width={118} borderRadius={999} style={{ marginRight: 8, marginBottom: 8 }} />
                  <Skeleton height={28} width={84} borderRadius={999} style={{ marginRight: 8, marginBottom: 8 }} />
                </View>
              </View>
            ) : null}

            {providersError ? <Text className="mt-2 text-sm text-red-300">{providersError}</Text> : null}

            {!providersLoading && !providersError && providers.length === 0 ? (
              <Text className="mt-2 text-sm text-zinc-300">No streaming provider data available in your region.</Text>
            ) : null}

            {!providersLoading && providers.length > 0 ? (
              <View className="mt-3 flex-row flex-wrap">
                {providers.map((provider) => (
                  <View
                    key={`${finalRecommendation.id}-${provider}`}
                    className="mb-2 mr-2 rounded-full border border-primary/50 bg-primary/15 px-3 py-1"
                  >
                    <Text className="text-xs font-semibold text-primary">{provider}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </Animated.View>
      </ScrollView>

      <View className="border-t border-zinc-800 bg-zinc-950 px-6 pb-8 pt-4">
        <View className="flex-row">
          <View className="mr-3 flex-1">
            <Button label="Perfect, thanks!" onPress={handleEndSession} />
          </View>
          <View className="flex-1">
            <Button
              label={isFindingRunnerUp ? "Finding runner-up..." : "Not feeling it"}
              variant="secondary"
              disabled={loading || isFindingRunnerUp}
              onPress={handleFindRunnerUp}
            />
          </View>
        </View>

        {error ? <Text className="mt-3 text-sm text-red-300">{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}
