import * as Haptics from "expo-haptics";

import type { SwipeResult } from "../types";

async function runHaptic(work: () => Promise<void>) {
  try {
    await work();
  } catch {
    // Ignore haptic errors on unsupported platforms/devices.
  }
}

export function triggerSwipeHaptic(result: SwipeResult) {
  return runHaptic(() =>
    Haptics.impactAsync(
      result === "like" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ),
  );
}

export function triggerSuccessHaptic() {
  return runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function triggerErrorHaptic() {
  return runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}

export function triggerSelectionHaptic() {
  return runHaptic(() => Haptics.selectionAsync());
}
