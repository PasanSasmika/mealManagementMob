import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { mealService } from '../src/services/api';
import { Utensils, Clock, ChevronLeft, Send, Lock, AlertCircle, Ticket, CheckCircle2 } from 'lucide-react-native';
import "../global.css";

export default function RequestNowScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false); 
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  const pollingInterval = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchInitialStatus();
    return () => {
      clearInterval(timer);
      stopPolling();
    };
  }, []);

  const fetchInitialStatus = async () => {
    try {
      const response = await mealService.requestNow({ action: false });
      const activeMeals = response.data.data;
      setMeals(activeMeals || []);
      
      const currentMeal = activeMeals?.find((m: any) => m.mealType === activeMealType);
      if (currentMeal?.status === 'ACTIVE') {
        startPolling();
      }
    } catch (e) {
      console.log("Status fetch failed");
    }
  };

  const startPolling = () => {
    if (pollingInterval.current) return;
    pollingInterval.current = setInterval(async () => {
      try {
        const response = await mealService.requestNow({ action: false });
        const updatedMeals = response.data.data;
        setMeals(updatedMeals);

        const currentMeal = updatedMeals.find((m: any) => m.mealType === activeMealType);
        if (currentMeal && currentMeal.status !== 'ACTIVE') {
          stopPolling();
        }
      } catch (e) { console.log("Polling..."); }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const handleRequestMeal = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const response = await mealService.requestNow({ action: true }); 
      const activeMeals = response.data.data;
      
      if (activeMeals && activeMeals.length > 0) {
        setMeals(activeMeals); 
        Alert.alert(
          "Request Sent / ඉල්ලීම යොමු කළා / கோரிக்கை அனுப்பப்பட்டது",
          "The canteen can now see your request.",
          [{ text: "OK" }]
        );
        startPolling(); 
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

  const handleVerifyOTP = async () => {
    if (otpInput.length < 4) {
      Alert.alert("Wait", "Please enter the 4-digit code.");
      return;
    }
    setVerifying(true);
    try {
      await mealService.verifyOtp(currentMealId, otpInput);
      
      // FIX: Standard Expo Router navigation to the dynamic route
      // Path must exist at app/pay-select/[id].tsx
      router.push({
        pathname: "/pay-select/[id]",
        params: { id: currentMealId }
      });
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Invalid OTP. Please try again.";
      Alert.alert("Verification Failed", errorMsg);
    } finally {
      setVerifying(false);
    }
  };

  const currentHour = currentTime.getHours();
  const activeMealType = currentHour < 12 ? 'BREAKFAST' : 'LUNCH';
  const currentMeal = meals.find(m => m.mealType === activeMealType);
  const currentMealId = currentMeal?._id;

  const mealTypes = [
    { id: 'BREAKFAST', si: 'උදේ ආහාරය', ta: 'காலை உணவு', isMorning: true },
    { id: 'LUNCH', si: 'දවල් ආහාරය', ta: 'மதிய உணவு', isMorning: false }
  ];

  return (
    <ScrollView className="flex-1 bg-emerald-50 px-6 pt-12">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <ChevronLeft size={28} color="#059669" />
      </TouchableOpacity>

      <Text className="text-3xl font-black text-emerald-900 mb-1">Meal Status</Text>
      <Text className="text-emerald-600 font-bold">ආහාර වේලෙහි තත්ත්වය</Text>
      <Text className="text-emerald-500 text-xs mb-8">உணவு நிலை</Text>

      <View className="gap-y-4 mb-8">
        {mealTypes.map((type) => {
          const isLocked = type.isMorning ? currentHour >= 12 : currentHour < 12;
          const mealInDb = meals.find(m => m.mealType === type.id);

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
                {mealInDb && (
                  <View className="bg-emerald-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-[10px] font-bold uppercase">{mealInDb.status}</Text>
                  </View>
                )}
              </View>

              {isLocked && (
                <View className="mt-3 pt-3 border-t border-gray-300">
                   <Text className="text-[10px] text-gray-500 font-bold uppercase">
                    Not available now / දැනට ලබාගත නොහැක / தற்போது கிடைக்கவில்லை
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {!hasError ? (
        <View className="bg-white rounded-[40px] p-8 shadow-xl shadow-emerald-200 border border-emerald-100">
          
          {currentMeal?.status === 'ACCEPTED' && (
            <View>
              <View className="mb-4 p-6 bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl items-center">
                <Ticket size={32} color="#b45309" />
                <Text className="text-amber-600 font-bold text-xs mt-2 uppercase">Your OTP / ඔබගේ කේතය / உங்கள் குறியீடு</Text>
                <Text className="text-5xl font-black text-amber-700 tracking-[10px] my-3">{currentMeal.otp}</Text>
                <Text className="text-[10px] text-amber-500 text-center font-medium">Show this to the canteen staff</Text>
              </View>

              <View className="mb-6">
                <Text className="text-emerald-800 font-bold text-xs mb-2 ml-2">Type Code Here / කේතය මෙහි ඇතුළත් කරන්න</Text>
                <TextInput
                  value={otpInput}
                  onChangeText={setOtpInput}
                  placeholder="0000"
                  keyboardType="number-pad"
                  maxLength={4}
                  className="bg-slate-100 rounded-2xl py-4 px-6 text-2xl font-black text-center text-emerald-900 border border-slate-200"
                />
              </View>
            </View>
          )}

          <TouchableOpacity 
            onPress={() => {
              if (currentMeal?.status === 'ACCEPTED') {
                handleVerifyOTP(); 
              } else if (currentMeal?.status === 'OTP_VERIFIED') {
                router.push({
                    pathname: "/pay-select/[id]",
                    params: { id: currentMealId }
                } as any);
              } else {
                handleRequestMeal();
              }
            }}
            disabled={loading || verifying || currentMeal?.status === 'ACTIVE' || currentMeal?.status === 'ISSUED'}
            className={`${currentMeal?.status === 'ACTIVE' ? 'bg-slate-400' : 'bg-emerald-600'} w-full py-5 rounded-3xl flex-row items-center justify-center shadow-lg shadow-emerald-400`}
          >
            <View className="items-center">
              <Text className="text-white font-black text-xl uppercase text-center">
                {currentMeal?.status === 'ACTIVE' ? 'Waiting for Canteen...' : 
                 currentMeal?.status === 'ACCEPTED' ? (verifying ? 'Verifying...' : 'Submit OTP') : `Request ${activeMealType}`}
              </Text>
              <Text className="text-emerald-100 font-bold text-[10px] text-center">
                {currentMeal?.status === 'ACTIVE' ? 'කරුණාකර රැඳී සිටින්න / காத்திருக்கவும்' : 
                 currentMeal?.status === 'ACCEPTED' ? 'කේතය තහවුරු කරන්න / குறியீட்டைச் சரிபார்க்கவும்' : 
                 'ආහාරය ඉල්ලන්න / உணவைக் கோருங்கள்'}
              </Text>
            </View>
            {loading || verifying ? <ActivityIndicator color="white" className="ml-4" /> : <Send size={24} color="white" className="ml-4" />}
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