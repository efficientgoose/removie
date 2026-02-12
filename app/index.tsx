import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ContentTypeSelector } from "../components/filters/ContentTypeSelector";
import { GenreSelector } from "../components/filters/GenreSelector";
import { LanguageSelector } from "../components/filters/LanguageSelector";
import { VibeInput } from "../components/filters/VibeInput";
import { YearRangeSelector } from "../components/filters/YearRangeSelector";
import { Button } from "../components/ui/Button";
import { useSessionStore } from "../stores/sessionStore";
import { triggerSelectionHaptic } from "../utils/haptics";

function toggleItem(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function FilterScreen() {
  const filters = useSessionStore((state) => state.filters);
  const updateFilters = useSessionStore((state) => state.updateFilters);
  const resetSession = useSessionStore((state) => state.resetSession);

  const canFindMovies = filters.languages.length > 0 && filters.genres.length > 0;

  const handleFindMovies = () => {
    void triggerSelectionHaptic();
    resetSession(true);
    router.push("/swipe");
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6" contentContainerClassName="pb-44 pt-6">
        <Text className="text-4xl font-bold text-white">ReMovie</Text>
        <Text className="mt-2 text-base text-zinc-300">
          Tell us your taste and we will build your swipe deck.
        </Text>

        <View className="mt-8">
          <ContentTypeSelector
            value={filters.contentType}
            onChange={(contentType) => updateFilters({ contentType })}
          />
          <LanguageSelector
            selected={filters.languages}
            onToggle={(languageCode) =>
              updateFilters({ languages: toggleItem(filters.languages, languageCode) })
            }
          />
          <GenreSelector
            selected={filters.genres}
            onToggle={(genreSlug) => updateFilters({ genres: toggleItem(filters.genres, genreSlug) })}
          />
          <YearRangeSelector value={filters.yearRange} onChange={(yearRange) => updateFilters({ yearRange })} />
          <VibeInput
            value={filters.vibeDescription ?? ""}
            onChange={(vibeDescription) => updateFilters({ vibeDescription })}
          />
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 px-6 pb-8 pt-4">
        <Text className="mb-3 text-sm text-zinc-400">
          Select at least 1 language and 1 genre to continue.
        </Text>
        <Button label="Find Movies" disabled={!canFindMovies} onPress={handleFindMovies} />
      </View>
    </SafeAreaView>
  );
}
