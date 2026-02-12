import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View className="flex-1 items-center justify-center bg-zinc-950 px-6">
        <View className="w-full rounded-3xl border border-red-500/50 bg-zinc-900 p-6">
          <Text className="text-center text-2xl font-bold text-red-300">Something went wrong</Text>
          <Text className="mt-3 text-center text-sm text-zinc-300">
            {this.state.message || "Unexpected runtime error"}
          </Text>
          <Pressable className="mt-6 items-center rounded-2xl bg-primary px-4 py-4" onPress={this.handleReset}>
            <Text className="text-base font-semibold text-white">Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
