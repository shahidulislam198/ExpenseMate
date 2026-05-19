import { useCurrency } from "@/lib/currency";
import { getAllSql } from "@/lib/database";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type TimeFrame = "1W" | "1M" | "6M" | "1Y";

interface BarData {
  label: string;
  income: number;
  expense: number;
}

interface CategoryTotal {
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
}

// ── Helpers ────────────────────────────────────────────────────

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay()); // Sunday
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (dt: Date) => `${dt.getMonth() + 1}/${dt.getDate()}`;
  return `${fmt(start)}-${fmt(end)}`;
}

function getMonthLabel(ym: string): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [, m] = ym.split("-").map(Number);
  return months[m - 1];
}

function getDayLabel(dateStr: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const d = new Date(dateStr + "T00:00:00");
  return days[d.getDay()];
}

// ── Component ──────────────────────────────────────────────────

export default function Dashboard() {
  const { currency } = useCurrency();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1W");
  const [summary, setSummary] = useState<BarData[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [topExpenseCats, setTopExpenseCats] = useState<CategoryTotal[]>([]);
  const [topIncomeCats, setTopIncomeCats] = useState<CategoryTotal[]>([]);

  const timeFrameOptions: { key: TimeFrame; label: string }[] = [
    { key: "1W", label: "Week" },
    { key: "1M", label: "Month" },
    { key: "6M", label: "6 Months" },
    { key: "1Y", label: "Year" },
  ];

  const chartTitle = useMemo(() => {
    switch (timeFrame) {
      case "1W":
        return "Daily Breakdown";
      case "1M":
        return "Weekly Breakdown";
      case "6M":
        return "Monthly Breakdown";
      case "1Y":
        return "Monthly Breakdown";
    }
  }, [timeFrame]);

  const loadData = useCallback(async () => {
    let dateFilter = "";
    if (timeFrame === "1W") dateFilter = "WHERE date >= date('now', '-7 days')";
    else if (timeFrame === "1M")
      dateFilter = "WHERE date >= date('now', '-1 month')";
    else if (timeFrame === "6M")
      dateFilter = "WHERE date >= date('now', '-6 months')";
    else if (timeFrame === "1Y")
      dateFilter = "WHERE date >= date('now', '-1 year')";

    // ── Fetch raw data based on timeframe granularity ──────────
    let groupBy: string;
    let orderBy: string;
    if (timeFrame === "1W") {
      // Daily granularity
      groupBy = "date";
      orderBy = "bucket ASC";
    } else if (timeFrame === "1M") {
      // Weekly granularity: group by week start (Sunday)
      groupBy = `strftime('%Y-%m-%d', date, '-' || ((strftime('%w', date) + 0) || 7) - 1 || ' days')`;
      orderBy = "bucket ASC";
    } else {
      // Monthly granularity (6M and 1Y)
      groupBy = "strftime('%Y-%m', date)";
      orderBy = "bucket ASC";
    }

    const rawRows = await getAllSql<{
      bucket: string;
      type: string;
      total: number;
    }>(
      `SELECT ${groupBy} as bucket, type, SUM(amount) as total
       FROM transactions
       ${dateFilter}
       GROUP BY bucket, type
       ORDER BY ${orderBy}`,
    );

    // ── Build bar data ─────────────────────────────────────────
    const map = new Map<string, { income: number; expense: number }>();
    for (const r of rawRows) {
      if (!map.has(r.bucket)) map.set(r.bucket, { income: 0, expense: 0 });
      const entry = map.get(r.bucket)!;
      if (r.type === "income") entry.income = r.total;
      else entry.expense = r.total;
    }

    const bars: BarData[] = [];
    map.forEach((v, k) => {
      let label: string;
      if (timeFrame === "1W") {
        label = getDayLabel(k);
      } else if (timeFrame === "1M") {
        label = getWeekLabel(k);
      } else {
        label = getMonthLabel(k);
      }
      bars.push({ label, ...v });
    });

    // Sort: for 1W by day order, for others by insertion (already sorted)
    if (timeFrame === "1W") {
      const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      bars.sort(
        (a, b) => dayOrder.indexOf(a.label) - dayOrder.indexOf(b.label),
      );
    }

    setSummary(bars);

    // ── Totals ─────────────────────────────────────────────────
    const totals = await getAllSql<{ type: string; total: number }>(
      `SELECT type, SUM(amount) as total FROM transactions ${dateFilter} GROUP BY type`,
    );
    setTotalIncome(totals.find((t) => t.type === "income")?.total ?? 0);
    setTotalExpense(totals.find((t) => t.type === "expense")?.total ?? 0);

    // ── Top expense categories ─────────────────────────────────
    const expCats = await getAllSql<CategoryTotal>(
      `SELECT c.name as category_name, c.icon as category_icon, c.color as category_color,
              SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.type = 'expense' ${dateFilter.replace("WHERE", "AND")}
       GROUP BY c.id
       ORDER BY total DESC
       LIMIT 5`,
    );
    setTopExpenseCats(expCats);

    // ── Top income categories ──────────────────────────────────
    const incCats = await getAllSql<CategoryTotal>(
      `SELECT c.name as category_name, c.icon as category_icon, c.color as category_color,
              SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.type = 'income' ${dateFilter.replace("WHERE", "AND")}
       GROUP BY c.id
       ORDER BY total DESC
       LIMIT 5`,
    );
    setTopIncomeCats(incCats);
  }, [timeFrame]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const maxBarValue = Math.max(
    ...summary.map((s) => Math.max(s.income, s.expense)),
    1,
  );

  const balance = totalIncome - totalExpense;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Time Frame Selector */}
      <View className="mx-4 mt-4 flex-row bg-gray-100/80 rounded-2xl p-1 gap-1">
        {timeFrameOptions.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setTimeFrame(opt.key)}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              timeFrame === opt.key
                ? "bg-white shadow-sm shadow-gray-200"
                : "bg-transparent"
            }`}
          >
            <Text
              className={`font-bold text-xs ${
                timeFrame === opt.key ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Cards */}
      <View className="flex-row gap-3 px-4 mt-4">
        <View className="flex-1 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <View className="w-7 h-7 rounded-xl bg-emerald-100 items-center justify-center">
              <Ionicons name="arrow-down-circle" size={15} color="#10B981" />
            </View>
            <Text className="text-gray-400 text-[9px] font-bold tracking-wider uppercase">
              Income
            </Text>
          </View>
          <Text className="text-emerald-600 text-base font-extrabold">
            {currency.symbol}
            {totalIncome.toFixed(0)}
          </Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <View className="w-7 h-7 rounded-xl bg-rose-100 items-center justify-center">
              <Ionicons name="arrow-up-circle" size={15} color="#F43F5E" />
            </View>
            <Text className="text-gray-400 text-[9px] font-bold tracking-wider uppercase">
              Expenses
            </Text>
          </View>
          <Text className="text-rose-500 text-base font-extrabold">
            {currency.symbol}
            {totalExpense.toFixed(0)}
          </Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <View className="w-7 h-7 rounded-xl bg-indigo-100 items-center justify-center">
              <Ionicons name="wallet-outline" size={15} color="#6366F1" />
            </View>
            <Text className="text-gray-400 text-[9px] font-bold tracking-wider uppercase">
              Balance
            </Text>
          </View>
          <Text
            className={`text-base font-extrabold ${
              balance >= 0 ? "text-indigo-600" : "text-rose-500"
            }`}
          >
            {currency.symbol}
            {balance.toFixed(0)}
          </Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-lg bg-indigo-100 items-center justify-center">
              <Ionicons name="bar-chart" size={18} color="#6366F1" />
            </View>
            <Text className="text-gray-800 font-bold text-base">
              {chartTitle}
            </Text>
          </View>
          {/* Legend */}
          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <Text className="text-[10px] text-gray-400 font-medium">
                Income
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <Text className="text-[10px] text-gray-400 font-medium">
                Expense
              </Text>
            </View>
          </View>
        </View>
        {summary.length === 0 ? (
          <View className="items-center py-10">
            <Ionicons name="analytics-outline" size={40} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm mt-2">
              No data for this period
            </Text>
          </View>
        ) : (
          <View>
            {/* Bars */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              <View
                className="flex-row items-end"
                style={{ minHeight: 160, gap: timeFrame === "1W" ? 10 : 6 }}
              >
                {summary.map((s, i) => {
                  const incPct =
                    maxBarValue > 0 ? (s.income / maxBarValue) * 100 : 0;
                  const expPct =
                    maxBarValue > 0 ? (s.expense / maxBarValue) * 100 : 0;
                  const barW =
                    timeFrame === "1W" ? 26 : timeFrame === "1Y" ? 18 : 22;
                  return (
                    <View key={i} className="items-center" style={{ gap: 4 }}>
                      {/* Value labels on top */}
                      <View
                        className="items-center mb-0.5"
                        style={{ height: 30, justifyContent: "flex-end" }}
                      >
                        {s.income > 0 && (
                          <Text className="text-[8px] font-bold text-emerald-600">
                            +{s.income.toFixed(0)}
                          </Text>
                        )}
                        {s.expense > 0 && (
                          <Text className="text-[8px] font-bold text-rose-500">
                            -{s.expense.toFixed(0)}
                          </Text>
                        )}
                      </View>
                      {/* Bars */}
                      <View
                        className="flex-row items-end"
                        style={{ gap: 2, height: 110 }}
                      >
                        {/* Income bar */}
                        <View
                          style={{
                            height: Math.max(
                              incPct * 1.1,
                              s.income > 0 ? 3 : 0,
                            ),
                            width: barW / 2 - 1,
                            backgroundColor: "#10B981",
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                          }}
                        />
                        {/* Expense bar */}
                        <View
                          style={{
                            height: Math.max(
                              expPct * 1.1,
                              s.expense > 0 ? 3 : 0,
                            ),
                            width: barW / 2 - 1,
                            backgroundColor: "#FB7185",
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                          }}
                        />
                      </View>
                      {/* Labels */}
                      <Text
                        className="text-[9px] text-gray-400 font-medium mt-1"
                        style={{ width: barW + 4, textAlign: "center" }}
                        numberOfLines={1}
                      >
                        {s.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            {/* Grid lines hint */}
            <View className="flex-row justify-between mt-2 px-1">
              <Text className="text-[8px] text-gray-300">
                {currency.symbol}0
              </Text>
              <Text className="text-[8px] text-gray-300">
                {currency.symbol}
                {Math.round(maxBarValue / 2)}
              </Text>
              <Text className="text-[8px] text-gray-300">
                {currency.symbol}
                {Math.round(maxBarValue)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Top Expense Categories */}
      {topExpenseCats.length > 0 && (
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-lg bg-red-100 items-center justify-center">
              <Ionicons name="trending-down" size={18} color="#EF4444" />
            </View>
            <Text className="text-gray-800 font-bold text-base">
              Top Expense Categories
            </Text>
          </View>
          {topExpenseCats.map((cat, i) => {
            const pct =
              topExpenseCats.reduce((s, c) => s + c.total, 0) > 0
                ? (cat.total /
                    topExpenseCats.reduce((s, c) => s + c.total, 0)) *
                  100
                : 0;
            return (
              <View key={i} className="mb-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-gray-700 text-sm">
                    {cat.category_icon} {cat.category_name}
                  </Text>
                  <Text className="text-gray-500 text-sm font-semibold">
                    {currency.symbol}
                    {cat.total.toFixed(2)}
                  </Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.category_color,
                    }}
                    className="h-full rounded-full"
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Top Income Categories */}
      {topIncomeCats.length > 0 && (
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm mb-6 border border-gray-100">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-lg bg-green-100 items-center justify-center">
              <Ionicons name="trending-up" size={18} color="#22C55E" />
            </View>
            <Text className="text-gray-800 font-bold text-base">
              Top Income Sources
            </Text>
          </View>
          {topIncomeCats.map((cat, i) => {
            const totalTop = topIncomeCats.reduce((s, c) => s + c.total, 0);
            const pct = totalTop > 0 ? (cat.total / totalTop) * 100 : 0;
            return (
              <View key={i} className="mb-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-gray-700 text-sm">
                    {cat.category_icon} {cat.category_name}
                  </Text>
                  <Text className="text-gray-500 text-sm font-semibold">
                    {currency.symbol}
                    {cat.total.toFixed(2)}
                  </Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.category_color,
                    }}
                    className="h-full rounded-full"
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
