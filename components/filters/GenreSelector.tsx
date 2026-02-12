import { Text, View } from "react-native";

import { GENRE_OPTIONS } from "../../constants/genres";
import { Chip } from "../ui/Chip";

interface GenreSelectorProps {
  selected: string[];
  onToggle: (genreSlug: string) => void;
}

export function GenreSelector({ selected, onToggle }: GenreSelectorProps) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-zinc-100">Genres</Text>
      <View className="flex-row flex-wrap">
        {GENRE_OPTIONS.map((genre) => (
          <Chip
            key={genre.slug}
            label={genre.label}
            selected={selected.includes(genre.slug)}
            onPress={() => onToggle(genre.slug)}
          />
        ))}
      </View>
    </View>
  );
}
