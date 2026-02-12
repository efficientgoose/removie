import { TextInput as RNTextInput } from "react-native";

interface TextInputProps {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
}

export function TextInput({ value, placeholder, onChangeText }: TextInputProps) {
  return (
    <RNTextInput
      className="min-h-24 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-zinc-100"
      multiline
      numberOfLines={4}
      placeholder={placeholder}
      placeholderTextColor="#71717A"
      textAlignVertical="top"
      value={value}
      onChangeText={onChangeText}
    />
  );
}
