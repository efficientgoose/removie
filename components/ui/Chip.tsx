import { Pressable, Text } from "react-native";

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      className={`mb-2 mr-2 rounded-full border px-4 py-2 ${
        selected
          ? "border-primary bg-primary/20"
          : "border-zinc-700 bg-zinc-900"
      }`}
      onPress={onPress}
    >
      <Text className={`text-sm font-medium ${selected ? "text-primary" : "text-zinc-200"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
