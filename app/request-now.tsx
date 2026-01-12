import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { mealService } from '../src/services/api';
import { Utensils, Clock, ChevronLeft, Lock } from 'lucide-react-native';
import "../global.css";

export default function RequestNowScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  // Store full Date object to show exact minutes like 11:39 AM
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchTodayMeals = async () => {
    setLoading(true);
    try {
      // Backend now returns both PENDING and ACTIVE meals for today
      const response = await mealService.requestNow();
      setMeals(response.data.data); 
    } catch (error: any) {
      console.error("Frontend Error:", error.response?.data || error.message);
      Alert.alert("Notice / දැනුම්දීම", "No pre-booked meals found for today.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch data every time the screen comes into focus to fix the "first time only" issue
  useFocusEffect(
    useCallback(() => {
      fetchTodayMeals();
    }, [])
  );

  useEffect(() => {
    // Update exact clock every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();

  // Helper to format exact time (e.g., 11:39 AM)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleMealPress = (meal: any, isLocked: boolean) => {
    if (isLocked) {
      const message = meal.mealType === 'BREAKFAST' 
        ? "Breakfast is only available before 12 PM / උදේ ආහාරය ලබාගත හැක්කේ දවල් 12ට පෙර පමණි." 
        : "Lunch is only available after 12 PM / දවල් ආහාරය ලබාගත හැක්කේ දවල් 12ට පසු පමණි.";
      Alert.alert("Time Restricted / කාලය සීමිතයි", message);
      return;
    }
    // Proceed to OTP verification with the selected meal ID
    // router.push(`/verify/${meal._id}`);
  };

  if (loading && meals.length === 0) {
    return <ActivityIndicator size="large" className="flex-1" color="#059669" />;
  }

  return (
    <ScrollView className="flex-1 bg-emerald-50 px-6 pt-12">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <ChevronLeft size={28} color="#059669" />
      </TouchableOpacity>

      <Text className="text-3xl font-black text-emerald-900 mb-1">Today's Meals</Text>
      <Text className="text-emerald-600 font-bold">අද දවසේ ආහාර වේල්</Text>
      <Text className="text-emerald-500 text-xs mb-8">இன்றைய உணவு</Text>

      {meals.map((meal) => {
        // Logic: Breakfast locked if >= 12, Lunch locked if < 12
        const isLocked = meal.mealType === 'BREAKFAST' ? currentHour >= 12 : currentHour < 12;

        return (
          <TouchableOpacity
            key={meal._id}
            disabled={isLocked}
            onPress={() => handleMealPress(meal, isLocked)}
            className={`mb-6 rounded-[35px] p-8 border ${
              isLocked 
                ? 'bg-gray-200 border-gray-300 opacity-60' 
                : 'bg-white border-emerald-100 shadow-xl shadow-emerald-200'
            }`}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1">
                <View className={`p-4 rounded-2xl ${isLocked ? 'bg-gray-300' : 'bg-emerald-100'}`}>
                  {isLocked ? <Lock size={28} color="#9ca3af" /> : <Utensils size={28} color="#059669" />}
                </View>
                <View className="ml-4">
                  <Text className={`text-2xl font-black ${isLocked ? 'text-gray-500' : 'text-emerald-900'}`}>
                    {meal.mealType}
                  </Text>
                  <Text className={`font-bold text-[10px] ${isLocked ? 'text-gray-400' : 'text-emerald-600'}`}>
                    {meal.mealType === 'BREAKFAST' 
                        ? 'Before 12 PM / 12 ට පෙර / 12க்கு முன்' 
                        : 'After 12 PM / 12 ට පසු / 12க்குப் பின்'}
                  </Text>
                </View>
              </View>
              
              {!isLocked && (
                <View className="bg-emerald-600 px-4 py-2 rounded-full">
                  <Text className="text-white font-bold text-[10px]">ACTIVE</Text>
                </View>
              )}
            </View>

            {isLocked && (
              <View className="mt-4 pt-4 border-t border-gray-300">
                <Text className="text-gray-500 font-bold text-center text-[11px]">
                  NOT AVAILABLE NOW / දැනට ලබාගත නොහැක
                </Text>
                <Text className="text-gray-400 font-medium text-center text-[9px]">
                  தற்போது கிடைக்கவில்லை
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <View className="items-center mt-4 mb-10">
        <Clock size={20} color="#059669" />
        <Text className="text-emerald-800 font-black mt-2 text-xl">
          {formatTime(currentTime)}
        </Text>
        <Text className="text-emerald-600 font-bold text-[10px]">
          CURRENT TIME / වත්මන් වේලාව / தற்போதைய நேரம்
        </Text>
      </View>
    </ScrollView>
  );
}