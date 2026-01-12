import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CreditCard, Clock, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { mealService } from '../../src/services/api'; // Ensure path is correct
import "../../global.css";

export default function PaySelectScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const [loading, setLoading] = useState(false);

  const handleSelection = async (type: 'PAY_NOW' | 'NOT_PAY_NOW') => {
    setLoading(true);
    try {
      // Backend call: http://localhost:5000/api/meals/select-payment
      await mealService.choosePayment(id as string, type);
      
      // Navigate to a final screen to wait for the canteen to click "Finalize/Issue"
      router.push({
        pathname: "/pay-select/status",
        params: { id }
      });
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to submit selection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-emerald-50 px-6 pt-12">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <ChevronLeft size={28} color="#059669" />
      </TouchableOpacity>

      <View className="mb-8">
        <Text className="text-3xl font-black text-emerald-900 mb-1">Payment Method</Text>
        <Text className="text-emerald-600 font-bold">ගෙවීමේ ක්‍රමය තෝරන්න</Text>
        <Text className="text-emerald-500 text-xs">கட்டண முறையைத் தேர்ந்தெடுக்கவும்</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#059669" className="mt-20" />
      ) : (
        <View className="gap-y-6">
          <TouchableOpacity 
            onPress={() => handleSelection('PAY_NOW')}
            className="bg-white p-6 rounded-[35px] border-2 border-emerald-500 shadow-xl shadow-emerald-200"
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-emerald-100 p-4 rounded-2xl">
                <CreditCard size={32} color="#059669" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-black text-emerald-900">Pay Now</Text>
                <Text className="text-emerald-600 font-bold text-[10px] uppercase">දැන් ගෙවන්න / இப்போது செலுத்துங்கள்</Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm">Pay instantly using digital wallet/card.</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleSelection('NOT_PAY_NOW')}
            className="bg-white p-6 rounded-[35px] border-2 border-slate-200"
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-slate-100 p-4 rounded-2xl">
                <Clock size={32} color="#64748b" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-black text-slate-800">Pay Later</Text>
                <Text className="text-slate-500 font-bold text-[10px] uppercase">පසුව ගෙවන්න / பின்னர் செலுத்துங்கள்</Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm">Settle at counter or monthly payroll.</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}