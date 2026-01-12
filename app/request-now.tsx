import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { mealService } from '../src/services/api';
import { Utensils, Clock, ChevronLeft, Send, Lock, AlertCircle } from 'lucide-react-native';
import "../global.css";

export default function RequestNowScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false); 
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();

  const handleRequestMeal = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const response = await mealService.requestNow(); 
      const activeMeals = response.data.data;
      
      if (activeMeals && activeMeals.length > 0) {
        setMeals(activeMeals); 
        Alert.alert(
          "Request Sent / ඉල්ලීම යොමු කළා / கோரிக்கை அனுப்பப்பட்டது",
          "The canteen can now see your request.",
          [{ text: "OK" }]
        );
      } else {
        setHasError(true);
      }
    } catch (error: any) {
      setHasError(true);
      const msg = error.response?.data?.message || "No pre-booked meals found.";
      Alert.alert("Notice", msg);
    } finally {
      setLoading(false);
    }
  };

  const navigateToVerify = (id: string) => {
    router.push(`/verify/${id}` as any);
  };

  const mealTypes = [
    { id: 'BREAKFAST', si: 'උදේ ආහාරය', ta: 'காலை உணவு', isMorning: true },
    { id: 'LUNCH', si: 'දවල් ආහාරය', ta: 'மதிய உணவு', isMorning: false }
  ];

  const activeMealType = currentHour < 12 ? 'BREAKFAST' : 'LUNCH';
  const hasAlreadyActivated = meals.some(m => m.mealType === activeMealType);
  const currentMealId = meals.find(m => m.mealType === activeMealType)?._id;

  return (
    <ScrollView className="flex-1 bg-emerald-50 px-6 pt-12">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <ChevronLeft size={28} color="#059669" />
      </TouchableOpacity>

      <Text className="text-3xl font-black text-emerald-900 mb-1">Meal Status</Text>
      <Text className="text-emerald-600 font-bold">ආහාර වේලෙහි තත්ත්වය</Text>
      <Text className="text-emerald-500 text-xs mb-8">உணவு நிலை</Text>

      {/* 1. Meal Type Cards with Multilingual Locked Text */}
      <View className="gap-y-4 mb-8">
        {mealTypes.map((type) => {
          const isLocked = type.isMorning ? currentHour >= 12 : currentHour < 12;
          const isActiveInDB = meals.some(m => m.mealType === type.id);

          return (
            <View
              key={type.id}
              className={`rounded-[30px] p-5 border ${
                isLocked ? 'bg-gray-200 border-gray-300 opacity-80' : 'bg-white border-emerald-100 shadow-sm'
              }`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className={`p-3 rounded-xl ${isLocked ? 'bg-gray-300' : 'bg-emerald-100'}`}>
                    {isLocked ? <Lock size={20} color="#9ca3af" /> : <Utensils size={20} color="#059669" />}
                  </View>
                  <View className="ml-4">
                    <Text className={`text-lg font-black ${isLocked ? 'text-gray-500' : 'text-emerald-900'}`}>{type.id}</Text>
                    <Text className={`text-[10px] font-bold ${isLocked ? 'text-gray-400' : 'text-emerald-600'}`}>{type.si} / {type.ta}</Text>
                  </View>
                </View>
                {isActiveInDB && (
                  <View className="bg-emerald-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-[10px] font-bold">REQUESTED</Text>
                  </View>
                )}
              </View>

              {/* Added Multilingual Text for Locked Meals */}
              {isLocked && (
                <View className="mt-3 pt-3 border-t border-gray-300">
                   <Text className="text-[10px] text-gray-500 font-bold uppercase">
                    Not available now / දැනට ලබාගත නොහැක / தற்போது கிடைக்கவில்லை
                  </Text>
                  <Text className="text-[9px] text-gray-400 font-medium">
                    {type.isMorning ? "Breakfast available before 12 PM" : "Lunch available after 12 PM"}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* 2. Conditional Request Button Container */}
      {!hasError ? (
        <View className="bg-white rounded-[40px] p-8 shadow-xl shadow-emerald-200 border border-emerald-100">
          <TouchableOpacity 
            onPress={() => hasAlreadyActivated ? navigateToVerify(currentMealId) : handleRequestMeal()}
            disabled={loading}
            className="bg-emerald-600 w-full py-5 rounded-3xl flex-row items-center justify-center shadow-lg shadow-emerald-400"
          >
            <View className="items-center">
              <Text className="text-white font-black text-xl uppercase">
                {hasAlreadyActivated ? 'Verify OTP' : `Request ${activeMealType}`}
              </Text>
              <Text className="text-emerald-100 font-bold text-[10px]">
                {hasAlreadyActivated ? 'කේතය තහවුරු කරන්න / குறியீட்டைச் சரிபார்க்கவும்' : 'ආහාරය ඉල්ලන්න / உணவைக் கோருங்கள்'}
              </Text>
            </View>
            {loading ? <ActivityIndicator color="white" className="ml-4" /> : <Send size={24} color="white" className="ml-4" />}
          </TouchableOpacity>
        </View>
      ) : (
        <View className="items-center py-10 bg-white rounded-[40px] border border-red-100">
          <AlertCircle size={40} color="#ef4444" />
          <Text className="text-red-600 font-black mt-4 text-center px-6">
            No pre-booked meals found for today. {"\n"} 
            අද දින සඳහා ආහාර වෙන් කර නොමැත. {"\n"}
            இன்று முன்பதிவு செய்யப்பட்ட உணவு எதுவும் இல்லை.
          </Text>
        </View>
      )}

      {/* Real-time Clock */}
      <View className="items-center mt-12 mb-10">
        <Clock size={20} color="#059669" />
        <Text className="text-emerald-800 font-black mt-2 text-2xl">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </Text>
        <Text className="text-emerald-600 font-bold text-[10px]">CURRENT TIME / වත්මන් වේලාව / தற்போதைய நேரம்</Text>
      </View>
    </ScrollView>
  );
}