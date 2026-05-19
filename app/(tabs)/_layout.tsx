import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        headerStyle: {
          backgroundColor: "#4F46E5",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerTitle: "Expense Tracker",
          headerRight: () => (
            <View className="mr-4">
              <Ionicons name="wallet-outline" size={22} color="#C7D2FE" />
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View className={focused ? "-mt-1" : ""}>
              <Ionicons
                name={focused ? "pie-chart" : "pie-chart-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          headerTitle: "Transactions",
          headerRight: () => (
            <View className="mr-4">
              <Ionicons name="filter-outline" size={22} color="#C7D2FE" />
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View className={focused ? "-mt-1" : ""}>
              <Ionicons
                name={focused ? "receipt" : "receipt-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerTitle: "Settings",
          headerRight: () => (
            <View className="mr-4">
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#C7D2FE"
              />
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View className={focused ? "-mt-1" : ""}>
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
