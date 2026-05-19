import "@/global.css";
import { CurrencyProvider } from "@/lib/currency";
import { initializeDatabase } from "@/lib/schema";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    initializeDatabase().catch((err) =>
      console.error("Database init failed:", err),
    );
  }, []);

  return (
    <CurrencyProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="currency" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                headerShown: true,
                title: "New Transaction",
                headerStyle: { backgroundColor: "#4F46E5" },
                headerTintColor: "#FFFFFF",
                headerTitleStyle: { fontWeight: "800", fontSize: 18 },
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="ml-2"
                  >
                    <Ionicons name="close-circle" size={26} color="#C7D2FE" />
                  </TouchableOpacity>
                ),
              }}
            />
          </Stack>
        </SafeAreaView>
      </GestureHandlerRootView>
    </CurrencyProvider>
  );
}
