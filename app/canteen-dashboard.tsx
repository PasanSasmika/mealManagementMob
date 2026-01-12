import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { api } from '../src/services/api';
import { User, Check, X, Coffee, ChevronLeft } from 'lucide-react-native';
import "../global.css";
import {  useRouter } from 'expo-router';

export default function CanteenDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchRequests = async () => {
  try {
    const response = await api.get('/meals/dashboard');
    const now = new Date();
    const currentHour = now.getHours();

    // Filter logic: Only show Breakfast before 12 PM, and Lunch after 12 PM
    const filtered = response.data.filter((item: any) => {
      if (currentHour < 12) {
        return item.mealType === 'BREAKFAST';
      } else {
        return item.mealType === 'LUNCH';
      }
    });

    setRequests(filtered);
  } catch (error) {
    console.error("Poll error:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchRequests();
    // Real-time effect: Poll every 3 seconds to catch new employee clicks
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      // Step 4: Update status and generate OTP if accepted
      await api.patch('/meals/respond', { requestId, action });
      
      // Update local UI immediately
      setRequests(prev => prev.filter(req => req._id !== requestId));
      
      Alert.alert(
        action === 'ACCEPT' ? "Accepted / පිළිගත්තා" : "Rejected / ප්‍රතික්ෂේප කළා",
        `Request has been ${action.toLowerCase()}ed.`
      );
    } catch (error) {
      Alert.alert("Error", "Could not process request.");
    }
  };

  return (
    <View className="flex-1 bg-slate-100 px-6 pt-16">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <ChevronLeft size={28} color="#059669" />
      </TouchableOpacity>
      <View className="mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-black text-slate-900">Meal Queue</Text>
          <Text className="text-emerald-600 font-bold">පෝලිම / வரிசை</Text>
        </View>
        <View className="bg-emerald-500 px-3 py-1 rounded-full">
          <Text className="text-white font-bold">{requests.length} Active</Text>
        </View>
      </View>

      {loading && requests.length === 0 ? (
        <ActivityIndicator size="large" color="#059669" className="mt-10" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <View className="items-center mt-20 opacity-40">
              <Coffee size={60} color="#64748b" />
              <Text className="text-slate-500 font-bold mt-4">No active requests yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-200 mb-4">
              <View className="flex-row items-center mb-4">
                <View className="bg-slate-100 p-3 rounded-2xl mr-4">
                  <User size={24} color="#059669" />
                </View>
                <View>
                  <Text className="text-xl font-black text-slate-800">
                    {item.employeeId?.firstName} {item.employeeId?.lastName}
                  </Text>
                  <Text className="text-emerald-600 font-bold text-xs uppercase">
                    {item.mealType}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-x-3">
                <TouchableOpacity 
                  onPress={() => handleAction(item._id, 'ACCEPT')}
                  className="flex-1 bg-emerald-600 flex-row items-center justify-center py-4 rounded-2xl shadow-sm shadow-emerald-400"
                >
                  <Check size={20} color="white" />
                  <Text className="text-white font-bold ml-2">ACCEPT</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleAction(item._id, 'REJECT')}
                  className="flex-1 bg-red-50 flex-row items-center justify-center py-4 rounded-2xl border border-red-100"
                >
                  <X size={20} color="#ef4444" />
                  <Text className="text-red-600 font-bold ml-2">REJECT</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}