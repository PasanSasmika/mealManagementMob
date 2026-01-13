import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { api } from '../src/services/api';
import { User, Check, X, Coffee, LogOut } from 'lucide-react-native';
import "../global.css";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function CanteenDashboard() {
  const [activeRequests, setActiveRequests] = useState<any[]>([]); 
  const [verifiedRequests, setVerifiedRequests] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      const response = await api.get('/meals/dashboard');
      const now = new Date();
      const currentHour = now.getHours();
      const mealTypeToDisplay = currentHour < 12 ? 'BREAKFAST' : 'LUNCH';

      const active = response.data.filter((item: any) => 
        item.status === 'ACTIVE' && item.mealType === mealTypeToDisplay
      );
      
      const verified = response.data.filter((item: any) => 
        item.status === 'OTP_VERIFIED' && item.mealType === mealTypeToDisplay
      );

      setActiveRequests(active);
      setVerifiedRequests(verified);
    } catch (error) {
      console.error("Poll error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      await api.patch('/meals/respond', { requestId, action });
      fetchRequests(); 
    } catch (error) {
      Alert.alert("Error", "Could not process request.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const handleFinalize = async (requestId: string, issue: boolean) => {
    try {
      await api.patch('/meals/finalize', { requestId, issue });
      Alert.alert(issue ? "Success" : "Rejected", issue ? "Meal Issued" : "Meal Cancelled");
      fetchRequests(); 
    } catch (error) {
      Alert.alert("Error", "Failed to finalize.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-100 px-6 pt-16">
      {/* SECTION 1: INITIAL QUEUE */}
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-black text-slate-900">1. Meal Queue</Text>
          <Text className="text-emerald-600 font-bold text-[10px] uppercase">පෝලිම / வரிசை</Text>
        </View>
        <View className="bg-emerald-500 px-3 py-1 rounded-full">
          <Text className="text-white font-bold">{activeRequests.length} Active</Text>
        </View>
      </View>

      {activeRequests.length === 0 && verifiedRequests.length === 0 && (
          <View className="items-center mt-10 opacity-40">
            <Coffee size={40} color="#64748b" />
            <Text className="text-slate-500 font-bold mt-2">No Requests</Text>
          </View>
      )}

      {activeRequests.map((item) => (
        <View key={item._id} className="bg-white p-4 rounded-[25px] border border-slate-200 mb-3">
          <View className="flex-row items-center mb-3">
            <User size={20} color="#059669" />
            <Text className="ml-2 font-bold text-slate-800">{item.employeeId?.firstName} {item.employeeId?.lastName}</Text>
          </View>
          <View className="flex-row gap-x-2">
            <TouchableOpacity onPress={() => handleAction(item._id, 'ACCEPT')} className="flex-1 bg-emerald-600 py-3 rounded-xl items-center">
                <Text className="text-white font-black text-xs">ACCEPT</Text>
                <Text className="text-white text-[8px]">පිළිගන්න / ஏற்​றுக்கொள்</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleAction(item._id, 'REJECT')} className="flex-1 bg-red-50 py-3 rounded-xl items-center border border-red-100">
                <Text className="text-red-600 font-black text-xs">REJECT</Text>
                <Text className="text-red-400 text-[8px]">ප්‍රතික්ෂේප කරන්න / நிராகரி</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* SECTION 2: FINAL ISSUE */}
      <View className="mt-8 mb-4">
        <Text className="text-2xl font-black text-slate-900">2. Ready to Issue</Text>
        <Text className="text-blue-600 font-bold text-[10px] uppercase">බෙදා හැරීමට සූදානම් / வழங்க தயார்</Text>
      </View>

      {verifiedRequests.map((item) => (
        <View key={item._id} className="bg-white p-5 rounded-[30px] border-2 border-emerald-500 mb-4 shadow-md">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="bg-emerald-100 p-2 rounded-full mr-3">
                <User size={20} color="#059669" />
              </View>
              <Text className="text-lg font-black text-slate-800">
                {item.employeeId?.firstName}
              </Text>
            </View>
            
            <View className={`px-3 py-1 rounded-lg ${item.paymentType === 'PAY_NOW' ? 'bg-orange-100' : 'bg-blue-100'}`}>
              <Text className={`font-black text-[9px] ${item.paymentType === 'PAY_NOW' ? 'text-orange-600' : 'text-blue-600'}`}>
                {item.paymentType === 'PAY_NOW' ? '💳 PAY NOW / දැන් ගෙවන්න' : '🕒 PAY LATER / පසුව ගෙවන්න'}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-x-3">
            <TouchableOpacity 
              onPress={() => handleFinalize(item._id, true)}
              className="flex-1 bg-emerald-600 flex-row items-center justify-center py-4 rounded-2xl"
            >
              <View className="items-center">
                <Text className="text-white font-black">ISSUE MEAL</Text>
                <Text className="text-white text-[9px] pl-5 p-2">ආහාරය නිකුත් කරන්න / உணவை வழங்குங்கள்</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleFinalize(item._id, false)}
              className="bg-red-50 px-6 items-center justify-center py-4 rounded-2xl border border-red-100"
            >
              <X size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity 
            onPress={handleLogout}
            className="mt-36 border-2 border-red-100 bg-red-50/30 p-6 rounded-[35px] flex-row items-center justify-center"
          >
            <LogOut size={22} color="#ef4444" className="mr-4" />
            <View className="items-center">
              <Text className="text-red-600 font-black text-lg">Logout</Text>
              <Text className="text-red-400 font-bold text-[10px]">පද්ධතියෙන් ඉවත් වන්න / வெளியேறவும்</Text>
            </View>
          </TouchableOpacity>
      <View className="h-20" />
    </ScrollView>
  );
}