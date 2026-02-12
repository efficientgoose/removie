import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

interface SwipeOverlayProps {
  translateX: SharedValue<number>;
  threshold: number;
}

export function SwipeOverlay({ translateX, threshold }: SwipeOverlayProps) {
  const likeTintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, threshold], [0, 0.45], Extrapolation.CLAMP),
  }));

  const dislikeTintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -threshold], [0, 0.45], Extrapolation.CLAMP),
  }));

  const likeBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, threshold * 0.45], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(translateX.value, [0, threshold], [0.7, 1], Extrapolation.CLAMP),
      },
      { rotate: "-14deg" },
    ],
  }));

  const dislikeBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -threshold * 0.45], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(translateX.value, [0, -threshold], [0.7, 1], Extrapolation.CLAMP),
      },
      { rotate: "14deg" },
    ],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.likeTint, likeTintStyle]} />
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.dislikeTint, dislikeTintStyle]} />

      <Animated.View style={[styles.likeBadge, likeBadgeStyle]}>
        <Text style={styles.likeBadgeText}>LIKE</Text>
      </Animated.View>

      <Animated.View style={[styles.dislikeBadge, dislikeBadgeStyle]}>
        <Text style={styles.dislikeBadgeText}>NOPE</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  likeTint: {
    backgroundColor: "#22C55E",
  },
  dislikeTint: {
    backgroundColor: "#EF4444",
  },
  likeBadge: {
    position: "absolute",
    left: 20,
    top: 22,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "#34D399",
    backgroundColor: "rgba(6, 78, 59, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  dislikeBadge: {
    position: "absolute",
    right: 20,
    top: 22,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "#F87171",
    backgroundColor: "rgba(127, 29, 29, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  likeBadgeText: {
    color: "#6EE7B7",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
  dislikeBadgeText: {
    color: "#FCA5A5",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
