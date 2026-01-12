import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { mealService } from '../src/services/api';
import { Utensils, Clock, ChevronLeft, Send, Lock } from 'lucide-react-native';
import "../global.css";

export default function RequestNowScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Digital Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();

  // 2. Logic to Trigger Canteen Popup
  const handleRequestMeal = async (type: string) => {
    setLoading(true);
    try {
      // Moves status from PENDING to ACTIVE for today's meals
      const response = await mealService.requestNow(); 
      const activeMeals = response.data.data;
      setMeals(activeMeals); 

      Alert.alert(
        "Request Sent / ඉල්ලීම යොමු කළා",
        `${type} request is now visible to the canteen.`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      const msg = error.response?.data?.message || "No pre-booked meals found for today.";
      Alert.alert("Notice / දැනුම්දීම", msg);
    } finally {
      setLoading(false);
    }
  };

  const navigateToVerify = (id: string) => {
    router.push(`/verify/${id}` as any);
  };

  // Define static meal types to show before the API call
  const mealTypes = [
    { id: 'BREAKFAST', si: 'උදේ ආහාරය', lockAt: 12, isMorning: true },
    { id: 'LUNCH', si: 'දවල් ආහාරය', lockAt: 12, isMorning: false }
  ];

  return (
    <ScrollView className="flex-1 bg-emerald-50 px-6 pt-12">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <ChevronLeft size={28} color="#059669" />
      </TouchableOpacity>

      <Text className="text-3xl font-black text-emerald-900 mb-1">Check & Request</Text>
      <Text className="text-emerald-600 font-bold mb-8">ආහාරය පරීක්ෂා කර ඉල්ලන්න</Text>

      {/* 3. Visible Meal Selection Grid */}
      <View className="gap-y-6">
        {mealTypes.map((type) => {
          // Logic: Breakfast locked if >= 12, Lunch locked if < 12
          const isLocked = type.isMorning ? currentHour >= 12 : currentHour < 12;
          
          // Check if this meal has already been activated via API
          const activeMeal = meals.find(m => m.mealType === type.id);

          return (
            <View
              key={type.id}
              className={`rounded-[35px] p-6 border ${
                isLocked ? 'bg-gray-200 border-gray-300 opacity-60' : 'bg-white border-emerald-100 shadow-xl shadow-emerald-200'
              }`}
            >
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <View className={`p-4 rounded-2xl ${isLocked ? 'bg-gray-300' : 'bg-emerald-100'}`}>
                    {isLocked ? <Lock size={24} color="#9ca3af" /> : <Utensils size={24} color="#059669" />}
                  </View>
                  <View className="ml-4">
                    <Text className={`text-xl font-black ${isLocked ? 'text-gray-500' : 'text-emerald-900'}`}>{type.id}</Text>
                    <Text className={`text-[10px] font-bold ${isLocked ? 'text-gray-400' : 'text-emerald-600'}`}>{type.si}</Text>
                  </View>
                </View>
                
                {activeMeal && (
                  <View className="bg-emerald-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-[10px] font-bold">ACTIVE</Text>
                  </View>
                )}
              </View>

              {/* Action Button */}
              {!isLocked && (
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => activeMeal ? navigateToVerify(activeMeal._id) : handleRequestMeal(type.id)}
                  className="bg-emerald-600 w-full py-4 rounded-2xl flex-row items-center justify-center shadow-md shadow-emerald-400"
                >
                  <Text className="text-white font-black text-sm uppercase mr-2">
                    {activeMeal ? 'Verify OTP' : `Request ${type.id}`}
                  </Text>
                  {loading ? <ActivityIndicator color="white" size="small" /> : <Send size={18} color="white" />}
                </TouchableOpacity>
              )}

              {isLocked && (
                <Text className="text-center text-gray-500 font-bold text-[10px] py-2">
                  Not available at this time / දැනට ලබාගත නොහැක
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Real-time Clock */}
      <View className="items-center mt-12 mb-10">
        <Clock size={20} color="#059669" />
        <Text className="text-emerald-800 font-black mt-2 text-2xl">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </Text>
        <Text className="text-emerald-600 font-bold text-[10px]">CURRENT TIME / වත්මන් වේලාව</Text>
      </View>
    </ScrollView>
  );
}