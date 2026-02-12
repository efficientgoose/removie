import { useEffect } from "react";
import { type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = "100%", height, borderRadius = 12, style }: SkeletonProps) {
  const alpha = useSharedValue(0.35);

  useEffect(() => {
    alpha.value = withRepeat(withTiming(0.8, { duration: 900 }), -1, true);
  }, [alpha]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: alpha.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#3F3F46",
        },
        animatedStyle,
        style,
      ]}
    />
  );
}
