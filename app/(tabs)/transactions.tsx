import { useCurrency } from "@/lib/currency";
import { getAllSql, runSql } from "@/lib/database";
import { Transaction } from "@/lib/schema";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function Transactions() {
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const router = useRouter();

  const loadTransactions = useCallback(async () => {
    const rows = await getAllSql<Transaction>(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       ORDER BY t.date DESC, t.created_at DESC`,
    );
    setTransactions(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await runSql("DELETE FROM transactions WHERE id = ?", [id]);
            loadTransactions();
          },
        },
      ],
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <View className="mx-4 mb-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-row items-center">
      {/* Category Icon */}
      <View
        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: item.category_color + "18" }}
      >
        <Text className="text-lg">{item.category_icon}</Text>
      </View>

      {/* Details */}
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-gray-800 font-semibold text-sm">
            {item.category_name}
          </Text>
          <Ionicons
            name={item.type === "income" ? "arrow-down" : "arrow-up"}
            size={12}
            color={item.type === "income" ? "#22C55E" : "#EF4444"}
          />
        </View>
        {item.note ? (
          <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
            {item.note}
          </Text>
        ) : null}
        <Text className="text-gray-400 text-xs mt-0.5">
          {formatDate(item.date)}
        </Text>
      </View>

      {/* Amount & Delete */}
      <View className="items-end">
        <Text
          className={`font-bold text-base ${
            item.type === "income" ? "text-green-600" : "text-red-500"
          }`}
        >
          {item.type === "income" ? "+" : "-"}
          {currency.symbol}
          {item.amount.toFixed(2)}
        </Text>
        <View className="flex-row gap-1.5 mt-1.5">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/modal",
                params: {
                  id: item.id.toString(),
                  amount: item.amount.toString(),
                  type: item.type,
                  category_id: item.category_id.toString(),
                  note: item.note,
                  date: item.date,
                },
              })
            }
            className="w-7 h-7 rounded-full bg-indigo-50 items-center justify-center"
          >
            <Ionicons name="pencil" size={14} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="w-7 h-7 rounded-full bg-red-50 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {transactions.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <View className="w-24 h-24 rounded-full bg-indigo-50 items-center justify-center mb-4">
            <Ionicons name="wallet-outline" size={44} color="#A5B4FC" />
          </View>
          <Text className="text-gray-400 text-lg font-semibold">
            No transactions yet
          </Text>
          <Text className="text-gray-300 text-sm mt-1">
            Tap the + button to add one
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
        />
      )}

      {/* FAB - Add Transaction */}
      <TouchableOpacity
        onPress={() => router.push("/modal")}
        className="absolute bottom-6 right-6 w-15 h-15 bg-indigo-500 rounded-2xl items-center justify-center"
        style={{
          shadowColor: "#6366F1",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
