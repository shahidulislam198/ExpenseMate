import { useCurrency } from "@/lib/currency";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isLoaded } = useCurrency();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return <Redirect href="/currency" />;
}
