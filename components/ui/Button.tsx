import { Pressable, Text } from "react-native";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
}

export function Button({ label, onPress, disabled = false, variant = "primary" }: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      className={`items-center rounded-2xl px-4 py-4 ${
        disabled
          ? "bg-zinc-800"
          : isPrimary
            ? "bg-primary"
            : "border border-zinc-600 bg-zinc-900"
      }`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text
        className={`text-base font-semibold ${disabled ? "text-zinc-500" : isPrimary ? "text-white" : "text-zinc-100"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
