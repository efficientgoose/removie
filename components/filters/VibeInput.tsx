import { Text, View } from "react-native";

import { TextInput } from "../ui/TextInput";

interface VibeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function VibeInput({ value, onChange }: VibeInputProps) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-zinc-100">Vibe (Optional)</Text>
      <TextInput
        placeholder="mind-bending plots, feel-good comfort watch, dark and gritty..."
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}
