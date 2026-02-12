import { Text, View } from "react-native";

import { SUPPORTED_LANGUAGES } from "../../constants/languages";
import { Chip } from "../ui/Chip";

interface LanguageSelectorProps {
  selected: string[];
  onToggle: (languageCode: string) => void;
}

export function LanguageSelector({ selected, onToggle }: LanguageSelectorProps) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-zinc-100">Languages</Text>
      <View className="flex-row flex-wrap">
        {SUPPORTED_LANGUAGES.map((language) => (
          <Chip
            key={language.code}
            label={language.label}
            selected={selected.includes(language.code)}
            onPress={() => onToggle(language.code)}
          />
        ))}
      </View>
    </View>
  );
}
