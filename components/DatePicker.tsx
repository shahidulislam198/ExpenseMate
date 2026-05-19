import { useState } from "react";
import {
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface DatePickerProps {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onConfirm: (date: string) => void;
  onCancel: () => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_PER_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function getYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= currentYear - 20; y--) {
    years.push(y);
  }
  return years;
}

function getDays(month: number, year: number): number[] {
  const maxDays = DAYS_PER_MONTH[month];
  // Handle February in non-leap years
  if (month === 1) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const days = isLeap ? 29 : 28;
    return Array.from({ length: days }, (_, i) => i + 1);
  }
  return Array.from({ length: maxDays }, (_, i) => i + 1);
}

export default function DatePicker({
  visible,
  value,
  onConfirm,
  onCancel,
}: DatePickerProps) {
  const parsed = value ? new Date(value + "T00:00:00") : new Date();
  const [selectedYear, setSelectedYear] = useState(parsed.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(parsed.getMonth()); // 0-based
  const [selectedDay, setSelectedDay] = useState(parsed.getDate());

  const years = getYears();
  const days = getDays(selectedMonth, selectedYear);

  const handleConfirm = () => {
    const month = String(selectedMonth + 1).padStart(2, "0");
    const day = String(selectedDay).padStart(2, "0");
    onConfirm(`${selectedYear}-${month}-${day}`);
  };

  const formatDisplay = () => {
    const month = String(selectedMonth + 1).padStart(2, "0");
    const day = String(selectedDay).padStart(2, "0");
    return `${MONTHS[selectedMonth]} ${day}, ${selectedYear}`;
  };

  const renderNumberPicker = (
    data: number[],
    selected: number,
    onSelect: (val: number) => void,
    label: string,
  ) => (
    <View className="flex-1 items-center">
      <Text className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
        {label}
      </Text>
      <View className="h-48 bg-gray-50 rounded-xl overflow-hidden w-full">
        <FlatList
          data={data}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: 40,
            offset: 40 * index,
            index,
          })}
          initialScrollIndex={data.indexOf(selected)}
          renderItem={({ item }) => {
            const isSelected = item === selected;
            return (
              <TouchableOpacity
                onPress={() => onSelect(item)}
                className={`h-10 items-center justify-center rounded-lg mx-1 my-0.5 ${
                  isSelected ? "bg-indigo-500" : ""
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    isSelected ? "text-white" : "text-gray-700"
                  }`}
                >
                  {label === "Month" ? MONTHS[item] : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl p-5">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={onCancel} className="p-2">
                  <Text className="text-gray-400 font-semibold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-800 font-bold text-lg">
                  {formatDisplay()}
                </Text>
                <TouchableOpacity onPress={handleConfirm} className="p-2">
                  <Text className="text-indigo-500 font-bold text-base">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Pickers */}
              <View className="flex-row gap-3">
                {renderNumberPicker(
                  MONTHS.map((_, i) => i),
                  selectedMonth,
                  (val) => {
                    setSelectedMonth(val);
                    // Adjust day if out of range
                    const maxDays = getDays(val, selectedYear).length;
                    if (selectedDay > maxDays) {
                      setSelectedDay(maxDays);
                    }
                  },
                  "Month",
                )}
                {renderNumberPicker(days, selectedDay, setSelectedDay, "Day")}
                {renderNumberPicker(
                  years,
                  selectedYear,
                  setSelectedYear,
                  "Year",
                )}
              </View>

              {/* Quick actions */}
              <View className="flex-row gap-2 mt-4 pt-4 border-t border-gray-100">
                <TouchableOpacity
                  onPress={() => {
                    const today = new Date();
                    setSelectedYear(today.getFullYear());
                    setSelectedMonth(today.getMonth());
                    setSelectedDay(today.getDate());
                  }}
                  className="flex-1 py-3 bg-gray-100 rounded-xl items-center"
                >
                  <Text className="text-gray-600 font-semibold text-sm">
                    Today
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    setSelectedYear(yesterday.getFullYear());
                    setSelectedMonth(yesterday.getMonth());
                    setSelectedDay(yesterday.getDate());
                  }}
                  className="flex-1 py-3 bg-gray-100 rounded-xl items-center"
                >
                  <Text className="text-gray-600 font-semibold text-sm">
                    Yesterday
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
