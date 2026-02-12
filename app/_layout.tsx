import "react-native-gesture-handler";
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppErrorBoundary } from "../components/ui/AppErrorBoundary";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#09090B" }}>
      <AppErrorBoundary>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#09090B" },
            animation: "fade",
          }}
        />
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
