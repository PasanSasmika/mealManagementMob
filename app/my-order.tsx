import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, Trash2, Clock, AlertCircle } from 'lucide-react-native';
import { api, mealService } from '../src/services/api'; // Ensure this points to your axios instance
import "../global.css";

export default function MyOrderScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyOrders = async () => {
  try {
    const response = await mealService.getMyMeals(10); // ✅ NEW
    const sorted = response.data.data.sort((a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setOrders(sorted);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleCancel = async (mealType: string) => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel tomorrow's booking?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete('/meals/cancel-tomorrow', { data: { mealType } });
              Alert.alert("Success", "Booking cancelled successfully.");
              fetchMyOrders(); // Refresh list
            } catch (error: any) {
              Alert.alert("Cannot Cancel", error.response?.data?.message || "Something went wrong");
            }
          }
        }
      ]
    );
  };

  const isTomorrow = (dateString: string) => {
    const d = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return d.getUTCDate() === tomorrow.getUTCDate() && 
           d.getUTCMonth() === tomorrow.getUTCMonth();
  };

  const renderItem = ({ item }: { item: any }) => {
  // 1. Get Tomorrow's date at Midnight UTC to match your Backend logic
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0]; // "YYYY-MM-DD"
  
  const itemDateStr = new Date(item.date).toISOString().split('T')[0];

  // 2. Logic Check: Must be tomorrow AND still PENDING
  const isTomorrowMeal = itemDateStr === tomorrowStr;
  const canCancel = isTomorrowMeal && item.status === 'PENDING';

  return (
    <View className="bg-white p-5 rounded-[30px] mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center">
          <View className="bg-emerald-50 p-3 rounded-2xl mr-4">
            <Calendar size={24} color="#059669" />
          </View>
          <View>
            <Text className="text-lg font-black text-slate-800">
              {new Date(item.date).toLocaleDateString('en-GB', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })}
            </Text>
            <Text className="text-emerald-600 font-bold text-xs uppercase">{item.mealType}</Text>
          </View>
        </View>

        <View className={`px-3 py-1 rounded-full ${item.status === 'PENDING' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
          <Text className={`text-[10px] font-bold ${item.status === 'PENDING' ? 'text-amber-600' : 'text-emerald-600'}`}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* CANCELLATION BUTTON */}
      {canCancel ? (
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => handleCancel(item.mealType)}
          className="mt-4 bg-red-50 flex-row items-center justify-center py-4 rounded-2xl border border-red-100"
        >
          <Trash2 size={18} color="#ef4444" />
          <View className="ml-2 items-center">
            <Text className="text-red-600 font-black">Cancel Booking</Text>
            <Text className="text-red-400 text-[8px]">අවලංගු කරන්න / ரத்துசெய்</Text>
          </View>
        </TouchableOpacity>
      ) : (
        /* Optional: Show why they can't cancel (for testing) */
        isTomorrowMeal && item.status !== 'PENDING' && (
          <Text className="text-slate-400 text-[9px] mt-4 text-center italic">
            Cannot cancel: Meal already being processed
          </Text>
        )
      )}
    </View>
  );
};

  return (
    <View className="flex-1 bg-slate-50">
      <View className="pt-16 pb-6 px-6 bg-white flex-row items-center justify-between shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-xl">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900">My Bookings</Text>
        <View className="w-10" /> 
      </View>

      <View className="bg-blue-50 p-4 mx-6 mt-4 rounded-2xl flex-row items-center border border-blue-100">
  <Clock size={20} color="#2563eb" />
  <View className="ml-3 flex-1">
    <Text className="text-blue-800 font-bold text-xs">Note: Cancel tomorrow's meal before 12 PM today.</Text>
    <Text className="text-blue-600 text-[9px] font-medium">හෙට දින මෙනුව අවලංගු කිරීමට අද දහවල් 12 ට පෙර දන්වන්න.</Text>
  </View>
</View>

      {loading ? (
        <ActivityIndicator size="large" color="#059669" className="mt-20" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 24 }}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyOrders} />}
          ListEmptyComponent={
            <View className="items-center mt-20 opacity-30">
              <AlertCircle size={60} color="#64748b" />
              <Text className="text-slate-500 font-bold mt-4">No active bookings found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}