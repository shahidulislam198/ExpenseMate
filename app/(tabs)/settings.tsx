import { CURRENCIES, useCurrency } from "@/lib/currency";
import { execSql, getAllSql, getFirstSql, runSql } from "@/lib/database";
import { Category } from "@/lib/schema";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const CATEGORY_ICONS = [
  "🍔",
  "🚗",
  "🛒",
  "🏠",
  "💡",
  "❤️",
  "🎮",
  "📚",
  "💼",
  "❓",
  "💰",
  "📈",
  "🎁",
  "🏪",
  "💵",
  "✈️",
  "🐾",
  "👕",
  "🎵",
  "🏋️",
  "☕",
  "🎬",
  "📱",
  "💻",
  "🏦",
  "🎓",
  "🍕",
  "🚕",
  "🏥",
  "🎉",
];

const CATEGORY_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
  "#14B8A6",
  "#F43F5E",
  "#0EA5E9",
  "#84CC16",
  "#A855F7",
];

export default function Settings() {
  const { currency, setCurrencyCode } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"expense" | "income">("expense");
  const [newCatIcon, setNewCatIcon] = useState("📦");
  const [newCatColor, setNewCatColor] = useState("#6B7280");
  const [activeTab, setActiveTab] = useState<
    "categories" | "currency" | "data"
  >("categories");

  const loadCategories = useCallback(async () => {
    const rows = await getAllSql<Category>(
      "SELECT * FROM categories ORDER BY type, name",
    );
    setCategories(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories]),
  );

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }
    await runSql(
      "INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)",
      [newCatName.trim(), newCatType, newCatIcon, newCatColor],
    );
    setNewCatName("");
    setNewCatIcon("📦");
    setNewCatColor("#6B7280");
    setShowAddCat(false);
    loadCategories();
  };

  const handleDeleteCategory = async (cat: Category) => {
    // Check if category is in use
    const count = await getFirstSql<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM transactions WHERE category_id = ?",
      [cat.id],
    );
    if (count && count.cnt > 0) {
      Alert.alert(
        "Cannot Delete",
        `"${cat.name}" is used by ${count.cnt} transaction(s). Remove those first.`,
      );
      return;
    }
    Alert.alert("Delete Category", `Delete "${cat.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await runSql("DELETE FROM categories WHERE id = ?", [cat.id]);
          loadCategories();
        },
      },
    ]);
  };

  const handleResetData = () => {
    Alert.alert(
      "⚠️ Reset All Data",
      "This will delete ALL transactions. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await execSql("DELETE FROM transactions");
            Alert.alert("Done", "All transactions have been deleted.");
          },
        },
      ],
    );
  };

  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tab Switcher */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab("categories")}
          className={`flex-1 py-3.5 items-center flex-row justify-center gap-2 ${
            activeTab === "categories" ? "border-b-2 border-indigo-500" : ""
          }`}
        >
          <Ionicons
            name="grid"
            size={18}
            color={activeTab === "categories" ? "#6366F1" : "#9CA3AF"}
          />
          <Text
            className={`font-semibold ${
              activeTab === "categories" ? "text-indigo-500" : "text-gray-400"
            }`}
          >
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("currency")}
          className={`flex-1 py-3.5 items-center flex-row justify-center gap-2 ${
            activeTab === "currency" ? "border-b-2 border-indigo-500" : ""
          }`}
        >
          <Ionicons
            name="cash-outline"
            size={18}
            color={activeTab === "currency" ? "#6366F1" : "#9CA3AF"}
          />
          <Text
            className={`font-semibold ${
              activeTab === "currency" ? "text-indigo-500" : "text-gray-400"
            }`}
          >
            Currency
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("data")}
          className={`flex-1 py-3.5 items-center flex-row justify-center gap-2 ${
            activeTab === "data" ? "border-b-2 border-indigo-500" : ""
          }`}
        >
          <Ionicons
            name="cloud-outline"
            size={18}
            color={activeTab === "data" ? "#6366F1" : "#9CA3AF"}
          />
          <Text
            className={`font-semibold ${
              activeTab === "data" ? "text-indigo-500" : "text-gray-400"
            }`}
          >
            Data
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "categories" ? (
        <FlatList
          data={[
            {
              type: "expense",
              label: "Expense Categories",
              icon: "trending-down",
              iconColor: "#EF4444",
              items: expenseCats,
            },
            {
              type: "income",
              label: "Income Categories",
              icon: "trending-up",
              iconColor: "#22C55E",
              items: incomeCats,
            },
          ]}
          keyExtractor={(item) => item.type}
          renderItem={({ item }) => (
            <View className="mb-4">
              <View className="flex-row justify-between items-center px-4 py-2">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-7 h-7 rounded-lg items-center justify-center"
                    style={{ backgroundColor: item.iconColor + "18" }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={16}
                      color={item.iconColor}
                    />
                  </View>
                  <Text className="text-gray-500 font-semibold text-sm">
                    {item.label}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setNewCatType(item.type as "expense" | "income");
                    setShowAddCat(true);
                  }}
                  className="flex-row items-center gap-1"
                >
                  <Ionicons name="add-circle" size={20} color="#6366F1" />
                  <Text className="text-indigo-500 text-sm font-semibold">
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
              {item.items.map((cat) => (
                <View
                  key={cat.id}
                  className="flex-row items-center mx-4 mb-1 bg-white rounded-xl p-3"
                >
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: cat.color + "20" }}
                  >
                    <Text className="text-base">{cat.icon}</Text>
                  </View>
                  <Text className="flex-1 text-gray-800 font-medium">
                    {cat.name}
                  </Text>
                  <View
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <TouchableOpacity
                    onPress={() => handleDeleteCategory(cat)}
                    className="ml-3"
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          ListFooterComponent={<View className="h-20" />}
        />
      ) : activeTab === "currency" ? (
        <ScrollView className="flex-1">
          <View className="p-4">
            {/* Current Currency Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-lg bg-indigo-100 items-center justify-center">
                  <Ionicons name="cash-outline" size={18} color="#6366F1" />
                </View>
                <Text className="text-gray-800 font-bold text-base">
                  Current Currency
                </Text>
              </View>
              <View className="flex-row items-center gap-3 ml-10">
                <View className="w-14 h-14 rounded-2xl bg-indigo-500 items-center justify-center">
                  <Text className="text-white text-xl font-bold">
                    {currency.symbol}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-800 font-bold text-lg">
                    {currency.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">{currency.code}</Text>
                </View>
              </View>
            </View>

            {/* Currency List */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-lg bg-indigo-100 items-center justify-center">
                  <Ionicons name="swap-horizontal" size={18} color="#6366F1" />
                </View>
                <Text className="text-gray-800 font-bold text-base">
                  Change Currency
                </Text>
              </View>
              {CURRENCIES.map((cur) => {
                const isActive = currency.code === cur.code;
                return (
                  <TouchableOpacity
                    key={cur.code}
                    onPress={() => setCurrencyCode(cur.code)}
                    className={`flex-row items-center mb-1.5 rounded-xl p-3 border ${
                      isActive
                        ? "bg-indigo-50 border-indigo-400"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <View
                      className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                        isActive ? "bg-indigo-500" : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-base font-bold ${
                          isActive ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {cur.symbol}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-semibold text-sm">
                        {cur.name}
                      </Text>
                      <Text className="text-gray-400 text-xs">{cur.code}</Text>
                    </View>
                    {isActive && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#6366F1"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="p-4">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 rounded-lg bg-indigo-100 items-center justify-center">
                <Ionicons name="server-outline" size={18} color="#6366F1" />
              </View>
              <Text className="text-gray-800 font-bold text-base">
                Data Management
              </Text>
            </View>
            <Text className="text-gray-500 text-sm mb-4 ml-10">
              Manage your app data. Transactions can be reset, but categories
              will be preserved.
            </Text>
            <TouchableOpacity
              onPress={handleResetData}
              className="flex-row items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-xl py-3.5"
            >
              <Ionicons name="trash-bin-outline" size={20} color="#EF4444" />
              <Text className="text-red-500 font-semibold">
                Reset All Transactions
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Add Category Modal */}
      <Modal visible={showAddCat} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">
                New {newCatType === "expense" ? "Expense" : "Income"} Category
              </Text>
              <TouchableOpacity onPress={() => setShowAddCat(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text className="text-gray-500 text-sm font-medium mb-1">Name</Text>
            <TextInput
              value={newCatName}
              onChangeText={setNewCatName}
              placeholder="e.g. Groceries"
              className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 mb-4"
              placeholderTextColor="#9CA3AF"
            />

            {/* Icon Picker */}
            <Text className="text-gray-500 text-sm font-medium mb-2">Icon</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              <View className="flex-row gap-2">
                {CATEGORY_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setNewCatIcon(icon)}
                    className={`w-10 h-10 rounded-xl items-center justify-center ${
                      newCatIcon === icon
                        ? "bg-indigo-100 border-2 border-indigo-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text className="text-lg">{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Color Picker */}
            <Text className="text-gray-500 text-sm font-medium mb-2">
              Color
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {CATEGORY_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setNewCatColor(color)}
                  className={`w-9 h-9 rounded-full ${
                    newCatColor === color ? "border-4 border-gray-300" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleAddCategory}
              className="bg-indigo-500 rounded-xl py-4 items-center"
            >
              <Text className="text-white font-bold text-base">
                Add Category
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
