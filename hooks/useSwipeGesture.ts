import { Gesture } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { SwipeResult } from "../types";

const SWIPE_OUT_DURATION_MS = 180;
const ROTATION_DEGREES = 14;

interface UseSwipeGestureParams {
  enabled: boolean;
  containerWidth: number;
  onSwipe: (result: SwipeResult) => void;
  threshold?: number;
}

export function useSwipeGesture({
  enabled,
  containerWidth,
  onSwipe,
  threshold: thresholdOverride,
}: UseSwipeGestureParams) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const threshold = thresholdOverride ?? containerWidth * 0.28;

  const resetPosition = () => {
    "worklet";
    translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
    translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
  };

  const animateOffscreen = (result: SwipeResult) => {
    "worklet";
    const targetX = result === "like" ? containerWidth * 1.2 : -containerWidth * 1.2;

    translateX.value = withTiming(targetX, { duration: SWIPE_OUT_DURATION_MS }, (finished) => {
      if (!finished) {
        return;
      }

      runOnJS(onSwipe)(result);
    });
    translateY.value = withTiming(translateY.value * 0.4, { duration: SWIPE_OUT_DURATION_MS });
  };

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      translateX.value = 0;
      translateY.value = 0;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const projectedX = translateX.value + event.velocityX * 0.1;

      if (Math.abs(projectedX) >= threshold) {
        animateOffscreen(projectedX > 0 ? "like" : "dislike");
        return;
      }

      resetPosition();
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-containerWidth, containerWidth],
      [-ROTATION_DEGREES, ROTATION_DEGREES],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return {
    gesture,
    cardStyle,
    translateX,
    threshold,
  };
}
