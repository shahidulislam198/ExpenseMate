import { CURRENCIES, useCurrency } from "@/lib/currency";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CurrencySelectScreen() {
  const { currency, setCurrencyCode, isLoaded, hasSetCurrency } = useCurrency();
  const [selected, setSelected] = useState(currency.code);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // If currency was already set, skip to dashboard
  useEffect(() => {
    if (isLoaded && hasSetCurrency) {
      router.replace("/(tabs)/dashboard");
    }
  }, [isLoaded, hasSetCurrency, router]);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // If already set, show nothing while redirecting
  if (hasSetCurrency) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const handleContinue = async () => {
    setSaving(true);
    await setCurrencyCode(selected);
    router.replace("/(tabs)/dashboard");
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 px-5 pt-16 pb-8 rounded-b-[2.5rem]">
        <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mb-4">
          <Ionicons name="cash-outline" size={30} color="#FFFFFF" />
        </View>
        <Text className="text-white text-2xl font-extrabold mb-1">
          Choose Your Currency
        </Text>
        <Text className="text-indigo-200 text-sm">
          Select the currency you want to use for tracking your expenses. You
          can change this anytime in Settings.
        </Text>
      </View>

      {/* Currency List */}
      <FlatList
        data={CURRENCIES}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isSelected = selected === item.code;
          return (
            <TouchableOpacity
              onPress={() => setSelected(item.code)}
              className={`flex-row items-center mb-2 rounded-2xl p-4 border ${
                isSelected
                  ? "bg-indigo-50 border-indigo-400 shadow-sm"
                  : "bg-white border-gray-100"
              }`}
            >
              {/* Symbol */}
              <View
                className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                  isSelected ? "bg-indigo-500" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-lg font-bold ${
                    isSelected ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item.symbol}
                </Text>
              </View>

              {/* Name & Code */}
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-base">
                  {item.name}
                </Text>
                <Text className="text-gray-400 text-sm">{item.code}</Text>
              </View>

              {/* Radio */}
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  isSelected ? "border-indigo-500" : "border-gray-300"
                }`}
              >
                {isSelected && (
                  <View className="w-3 h-3 rounded-full bg-indigo-500" />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Continue Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={saving}
          className="bg-indigo-500 rounded-2xl py-4 items-center"
          style={{
            shadowColor: "#6366F1",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text className="text-white font-bold text-lg">
            {saving ? "Saving..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
