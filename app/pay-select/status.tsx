import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Utensils, XCircle, Clock } from 'lucide-react-native';
import { mealService } from '../../src/services/api';
import "../../global.css";

export default function MealStatusScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [status, setStatus] = useState('WAITING'); // WAITING, ISSUED, REJECTED

  useEffect(() => {
    // Poll the status every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await mealService.requestNow({ action: false });
        const meals = response.data.data;
        const currentMeal = meals.find((m: any) => m._id === id);
        
        if (currentMeal) {
          if (currentMeal.status === 'ISSUED') {
            setStatus('ISSUED');
            clearInterval(interval);
          } else if (currentMeal.status === 'REJECTED') {
            setStatus('REJECTED');
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.log("Polling final status...");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <View className="flex-1 bg-white items-center justify-center px-10">
      {status === 'WAITING' && (
        <>
          <View className="bg-amber-100 p-8 rounded-full mb-6">
            <Clock size={60} color="#b45309" />
          </View>
          <Text className="text-2xl font-black text-center text-amber-900">Waiting for Canteen</Text>
          <Text className="text-amber-600 font-bold text-center mt-2">කරුණාකර රැඳී සිටින්න / காத்திருக்கவும்</Text>
          <ActivityIndicator size="large" color="#b45309" className="mt-8" />
        </>
      )}

      {status === 'ISSUED' && (
        <>
         <CheckCircle2 size={80} color="#059669" />
    <Text className="text-3xl font-black text-emerald-900 mt-6">Meal Issued!</Text>
    
    {/* Success Message in 3 Languages */}
    <View className="items-center mt-2">
      <Text className="text-emerald-700 font-bold text-lg text-center">
        Enjoy your meal!
      </Text>
      <Text className="text-emerald-600 font-medium text-base text-center mt-1">
        ඔබේ ආහාරය භුක්ති විඳින්න
      </Text>
      <Text className="text-emerald-500 font-medium text-sm text-center">
        உங்கள் உணவை உண்ணுங்கள்
      </Text>
    </View>

    <TouchableOpacity 
          onPress={() => router.replace("/employee-dashboard")} 

      className="mt-10 bg-emerald-600 px-12 py-4 rounded-3xl shadow-lg shadow-emerald-200"
    >
      <Text className="text-white font-black text-lg">Done</Text>
    </TouchableOpacity>
  </>
      )}

      {status === 'REJECTED' && (
        <>
        <XCircle size={80} color="#ef4444" />
    <Text className="text-2xl font-black text-red-900 mt-6">Issue Rejected</Text>
    
    <View className="items-center mt-2">
      <Text className="text-red-600 font-bold text-center">
        Please contact the canteen counter.
      </Text>
      <Text className="text-red-500 text-xs text-center">
        කරුණාකර කවුන්ටරය විමසන්න / கவுண்டரை தொடர்பு கொள்ளவும்
      </Text>
    </View>

    <TouchableOpacity className="mt-10 border-2 border-red-200 px-10 py-3 rounded-2xl"
    onPress={() => router.replace("/employee-dashboard")}
    >
      <Text className="text-red-500 font-bold">Go Back</Text>
    </TouchableOpacity>
        </>
      )}
    </View>
  );
}