import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { mealService } from '../src/services/api';
import { ChevronLeft } from 'lucide-react-native';
import "../global.css";

export default function BookMealScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ✅ NEW: booked dates map to block calendar clicks
  const [bookedMap, setBookedMap] = useState<Record<string, Set<string>>>({
    BREAKFAST: new Set(),
    LUNCH: new Set(),
  });

  // Generate 10 days starting from today
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const availableDates = generateDates();

  const [selections, setSelections] = useState([
    {
      mealType: 'BREAKFAST',
      si: 'උදේ ආහාරය',
      ta: 'காலை உணவு',
      active: false,
      dates: [] as string[]
    },
    {
      mealType: 'LUNCH',
      si: 'දවල් ආහාරය',
      ta: 'மதிய உணவு',
      active: false,
      dates: [] as string[]
    }
  ]);

  // ✅ NEW: Load already booked meals so the calendar days are blocked
  const loadBookedMeals = async () => {
    try {
      const res = await mealService.getMyMeals(10);

      const map: Record<string, Set<string>> = {
        BREAKFAST: new Set(),
        LUNCH: new Set(),
      };

      res.data.data.forEach((m: any) => {
        const day = new Date(m.date).toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
        if (map[m.mealType]) map[m.mealType].add(day);
      });

      setBookedMap(map);
    } catch (e) {
      console.log("Failed to load booked meals", e);
    }
  };

  useEffect(() => {
    loadBookedMeals();
  }, []);

  const toggleMealActive = (index: number) => {
    const newSelections = [...selections];
    newSelections[index].active = !newSelections[index].active;
    if (!newSelections[index].active) newSelections[index].dates = [];
    setSelections(newSelections);
  };

  const toggleDateSelection = (mealIndex: number, dateStr: string) => {
    const newSelections = [...selections];
    const currentDates = newSelections[mealIndex].dates;

    if (currentDates.includes(dateStr)) {
      newSelections[mealIndex].dates = currentDates.filter(d => d !== dateStr);
    } else {
      newSelections[mealIndex].dates = [...currentDates, dateStr];
    }
    setSelections(newSelections);
  };

  const handleBookingSubmit = async () => {
    const finalSelections = selections.filter(s => s.active && s.dates.length > 0);

    if (finalSelections.length === 0) {
      Alert.alert("Error", "Please select at least one meal and date.");
      return;
    }

    // Normalize dates to Midnight UTC before sending to backend
    const normalizedSelections = finalSelections.map(selection => ({
      ...selection,
      dates: selection.dates.map(dateStr => {
        const d = new Date(dateStr);
        d.setUTCHours(0, 0, 0, 0); // Ensure it is exactly 00:00 UTC
        return d.toISOString();
      })
    }));

    setLoading(true);
    try {
      await mealService.bookMeals(normalizedSelections);

      // ✅ NEW: refresh booked map so UI blocks instantly
      await loadBookedMeals();

      Alert.alert(
        "Success",
        "Meals pre-booked successfully / ආහාර ඇණවුම සාර්ථකව ලබාදෙන ලදි / உங்கள் உணவு ஆர்டர் வெற்றிகரமாக செய்யப்பட்டுவிட்டது",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Failed", "Could not save your meal selection. / ආහාර ඇණවුම අසාර්ථකයි. / உணவு ஆர்டர் தோல்வியடைந்தது");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-emerald-50 px-6 pt-12">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <ChevronLeft size={28} color="#059669" />
      </TouchableOpacity>

      {/* Multilingual Main Titles */}
      <View className="mb-8">
        <Text className="text-3xl font-black text-emerald-900 mb-1">Book Your Meals</Text>
        <Text className="text-lg font-bold text-emerald-800 mb-2">ඔබට ආහාර අවශ්‍ය දින තෝරන්න</Text>
        <Text className="text-xs font-medium text-emerald-700">உங்களுக்கு உணவு தேவைப்படும் நாட்களைத் தேர்ந்தெடுக்கவும்</Text>
      </View>

      {selections.map((meal, mIndex) => (
        <View key={meal.mealType} className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-emerald-100">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-xl font-bold text-slate-800">{meal.mealType}</Text>
              <Text className="text-xs font-bold text-slate-500">{meal.si} / {meal.ta}</Text>
            </View>
            <Checkbox
              value={meal.active}
              onValueChange={() => toggleMealActive(mIndex)}
              color={meal.active ? '#059669' : undefined}
            />
          </View>

          {meal.active && (
            <View>
              <Text className="text-[10px] font-bold text-emerald-600 mb-3 uppercase tracking-tighter">
                Select Dates / දින තෝරන්න / தேதிகளைத் தேர்ந்தெடுக்கவும்
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {availableDates.map((date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isSelected = meal.dates.includes(dateStr);

                  // ✅ NEW: block day if already booked in DB for that meal type
                  const isBooked = bookedMap[meal.mealType]?.has(dateStr);
                  const isDisabled = isBooked;

                  return (
                    <TouchableOpacity
                      key={dateStr}
                      onPress={() => toggleDateSelection(mIndex, dateStr)}
                      disabled={isDisabled}
                      className={`w-12 h-12 items-center justify-center rounded-2xl border ${
                        isDisabled
                          ? 'bg-slate-200 border-slate-200 opacity-40'
                          : isSelected
                            ? 'bg-emerald-600 border-emerald-700'
                            : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Text className={`font-bold ${
                        isDisabled ? 'text-slate-500' : isSelected ? 'text-white' : 'text-slate-600'
                      }`}>
                        {date.getDate()}
                      </Text>

                      <Text className={`text-[8px] font-bold ${
                        isDisabled ? 'text-slate-400' : isSelected ? 'text-emerald-100' : 'text-slate-400'
                      }`}>
                        {date.toLocaleString('default', { month: 'short' })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

            
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity
        onPress={handleBookingSubmit}
        disabled={loading}
        className="bg-emerald-600 p-5 rounded-[25px] shadow-lg shadow-emerald-300 mt-4 mb-12"
      >
        <Text className="text-white text-center font-black text-lg">
          {loading ? "Saving..." : "Submit Selection / ඉදිරිපත් කරන්න / சமர்ப்பிக்கவும்"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}