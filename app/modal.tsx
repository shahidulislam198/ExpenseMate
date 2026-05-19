import DatePicker from "@/components/DatePicker";
import { useCurrency } from "@/lib/currency";
import { getAllSql, runSql } from "@/lib/database";
import { Category } from "@/lib/schema";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AddTransactionModal() {
  const { currency } = useCurrency();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    amount?: string;
    type?: string;
    category_id?: string;
    note?: string;
    date?: string;
  }>();

  const editId = params.id ? parseInt(params.id) : null;
  const isEditing = editId !== null;

  const [type, setType] = useState<"expense" | "income">(
    (params.type as "expense" | "income") || "expense",
  );
  const [amount, setAmount] = useState(params.amount || "");
  const [note, setNote] = useState(params.note || "");
  const [date, setDate] = useState(
    params.date || new Date().toISOString().slice(0, 10),
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(
    params.category_id ? parseInt(params.category_id) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadCategories = useCallback(async () => {
    const rows = await getAllSql<Category>(
      "SELECT * FROM categories WHERE type = ? ORDER BY name",
      [type],
    );
    setCategories(rows);
    if (rows.length > 0 && !rows.find((c) => c.id === selectedCatId)) {
      setSelectedCatId(rows[0].id);
    }
  }, [type]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories]),
  );

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!selectedCatId) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (!date) {
      Alert.alert("Error", "Please select a date");
      return;
    }

    if (isEditing && editId) {
      await runSql(
        "UPDATE transactions SET amount = ?, type = ?, category_id = ?, note = ?, date = ? WHERE id = ?",
        [amt, type, selectedCatId, note.trim(), date, editId],
      );
    } else {
      await runSql(
        "INSERT INTO transactions (amount, type, category_id, note, date) VALUES (?, ?, ?, ?, ?)",
        [amt, type, selectedCatId, note.trim(), date],
      );
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-gray-50">
        {/* Type Toggle */}
        <View className="flex-row mx-4 mt-4 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          <TouchableOpacity
            onPress={() => setType("expense")}
            className={`flex-1 py-3.5 rounded-xl items-center flex-row justify-center gap-2 ${
              type === "expense" ? "bg-red-500" : ""
            }`}
          >
            <Ionicons
              name="arrow-up-circle"
              size={20}
              color={type === "expense" ? "#FFFFFF" : "#EF4444"}
            />
            <Text
              className={`font-bold text-base ${
                type === "expense" ? "text-white" : "text-gray-400"
              }`}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setType("income")}
            className={`flex-1 py-3.5 rounded-xl items-center flex-row justify-center gap-2 ${
              type === "income" ? "bg-green-500" : ""
            }`}
          >
            <Ionicons
              name="arrow-down-circle"
              size={20}
              color={type === "income" ? "#FFFFFF" : "#22C55E"}
            />
            <Text
              className={`font-bold text-base ${
                type === "income" ? "text-white" : "text-gray-400"
              }`}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="cash-outline" size={18} color="#6366F1" />
            <Text className="text-gray-500 text-sm font-semibold">Amount</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-gray-800 mr-2">
              {currency.symbol}
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="flex-1 text-2xl font-bold text-gray-800"
              placeholderTextColor="#D1D5DB"
            />
          </View>
        </View>

        {/* Category Picker */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="pricetags-outline" size={18} color="#6366F1" />
            <Text className="text-gray-500 text-sm font-semibold">
              Category
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCatId(cat.id)}
                className={`flex-row items-center gap-1 px-3 py-2 rounded-full ${
                  selectedCatId === cat.id
                    ? "bg-indigo-100 border border-indigo-400"
                    : "bg-gray-100 border border-transparent"
                }`}
              >
                <Text>{cat.icon}</Text>
                <Text
                  className={`text-sm font-medium ${
                    selectedCatId === cat.id
                      ? "text-indigo-700"
                      : "text-gray-600"
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="create-outline" size={18} color="#6366F1" />
            <Text className="text-gray-500 text-sm font-semibold">Note</Text>
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Optional note..."
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800"
            placeholderTextColor="#9CA3AF"
            multiline
          />
        </View>

        {/* Date */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="calendar-outline" size={18} color="#6366F1" />
            <Text className="text-gray-500 text-sm font-semibold">Date</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between"
          >
            <Text className="text-gray-800 text-base font-medium">
              {(() => {
                const d = new Date(date + "T00:00:00");
                return d.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
              })()}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <DatePicker
          visible={showDatePicker}
          value={date}
          onConfirm={(newDate) => {
            setDate(newDate);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          className="mx-4 mt-6 mb-8 bg-indigo-500 rounded-2xl py-4 items-center flex-row justify-center gap-2 shadow-sm"
        >
          <Ionicons
            name={isEditing ? "pencil" : "checkmark-circle"}
            size={22}
            color="#FFFFFF"
          />
          <Text className="text-white font-bold text-lg">
            {isEditing ? "Update Transaction" : "Save Transaction"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
