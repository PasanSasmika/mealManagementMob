import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CreditCard, Clock, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import "../../global.css";
export default function PaySelectScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // This is your currentMealId

  const handleSelection = (type: 'PAY_NOW' | 'PAY_LATER') => {
    if (type === 'PAY_NOW') {
        // Navigate to your payment gateway or digital payment screen
        // router.push({ pathname: "/payment-gateway", params: { id } });
        console.log("Processing Payment for:", id);
    } else {
        // Navigate to a success/confirmation screen for later payment
        // router.push("/success-confirmation");
        console.log("Opted for Pay Later for:", id);
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

      <View className="gap-y-6">
        {/* Option 1: Pay Now */}
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
              <Text className="text-emerald-600 font-bold text-xs uppercase tracking-wider">දැන් ගෙවන්න / இப்போது செலுத்துங்கள்</Text>
            </View>
          </View>
          <Text className="text-gray-500 text-sm leading-5">
            Pay instantly using your digital wallet or card to skip the queue.
          </Text>
        </TouchableOpacity>

        {/* Option 2: Pay Later */}
        <TouchableOpacity 
          onPress={() => handleSelection('PAY_LATER')}
          className="bg-white p-6 rounded-[35px] border-2 border-slate-200"
        >
          <View className="flex-row items-center mb-4">
            <View className="bg-slate-100 p-4 rounded-2xl">
              <Clock size={32} color="#64748b" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-black text-slate-800">Not Pay Now</Text>
              <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider">පසුව ගෙවන්න / இப்போது செலுத்த வேண்டாம்</Text>
            </View>
          </View>
          <Text className="text-gray-500 text-sm leading-5">
            You can settle the payment later at the counter or via your monthly payroll.
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mt-12 items-center opacity-40">
        <CheckCircle2 size={40} color="#059669" />
        <Text className="text-[10px] font-bold text-emerald-900 mt-2 uppercase">Verified Meal ID: {id}</Text>
      </View>
    </ScrollView>
  );
}