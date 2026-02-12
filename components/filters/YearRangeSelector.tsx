import { Text, View } from "react-native";

import { Chip } from "../ui/Chip";
import type { YearRange } from "../../types";

interface YearRangeSelectorProps {
  value: YearRange;
  onChange: (value: YearRange) => void;
}

const YEAR_RANGE_OPTIONS: Array<{ value: YearRange; label: string }> = [
  { value: "2020s", label: "2020s" },
  { value: "2010s", label: "2010s" },
  { value: "2000s", label: "2000s" },
  { value: "classic", label: "Classic" },
  { value: "all", label: "All Time" },
];

export function YearRangeSelector({ value, onChange }: YearRangeSelectorProps) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-zinc-100">Year Range</Text>
      <View className="flex-row flex-wrap">
        {YEAR_RANGE_OPTIONS.map((option) => (
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
