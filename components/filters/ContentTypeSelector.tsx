import { Text, View } from "react-native";

import { Chip } from "../ui/Chip";
import type { ContentType } from "../../types";

interface ContentTypeSelectorProps {
  value: ContentType;
  onChange: (value: ContentType) => void;
}

const CONTENT_TYPE_OPTIONS: Array<{ value: ContentType; label: string }> = [
  { value: "movie", label: "Movie" },
  { value: "series", label: "Web Series" },
  { value: "both", label: "Both" },
];

export function ContentTypeSelector({ value, onChange }: ContentTypeSelectorProps) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-zinc-100">Content Type</Text>
      <View className="flex-row flex-wrap">
        {CONTENT_TYPE_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}
