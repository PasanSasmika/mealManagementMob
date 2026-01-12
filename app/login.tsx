import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../src/services/api';
import { UserCircle2, Smartphone, LogIn } from 'lucide-react-native';
import "../global.css";

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !mobileNumber) {
      Alert.alert("Error / දෝෂයක් / பிழை", "Please fill all fields / කරුණාකර සියලුම ක්ෂේත්‍ර පුරවන්න / தயவுசெய்து அனைத்து புலங்களையும் நிரப்பவும்");
      return;
    }

    setLoading(true);
    try {
    const response = await api.post('/auth/login', { username, mobileNumber });
    const { token, user } = response.data;

    // Save token, role, and firstName
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userRole', user.role);
    await AsyncStorage.setItem('userFirstName', user.firstName); // Save this!
    
    setAuthToken(token);

    if (user.role === 'CANTEEN') {
      router.replace('/canteen-dashboard');
    } else {
      router.replace('/employee-dashboard');
    }
  } catch (error) {
    Alert.alert("Login Failed", "Invalid Credentials");
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        // flexGrow: 1 allows content to center when small, but scroll when large
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }} 
        keyboardShouldPersistTaps="handled"
        // This is important for smooth scrolling
        automaticallyAdjustContentInsets={false}
        className="px-6"
      >
        {/* Header Section */}
        <View className="items-center mb-8 mt-10">
          <View className="bg-emerald-100 p-5 rounded-full mb-4 shadow-sm">
            <UserCircle2 size={70} color="#059669" />
          </View>
          <Text className="text-2xl font-black text-emerald-900 text-center">
            Welcome Back {"\n"} සාදරයෙන් පිළිගනිමු {"\n"} நல்வரவு
          </Text>
        </View>

        {/* Login Form Card */}
        <View className="bg-white p-6 rounded-[35px] shadow-xl shadow-emerald-200 border border-emerald-100">
          
          {/* Username Field */}
          <View className="mb-5">
            <Text className="text-emerald-800 font-bold mb-2 ml-1 text-xs">
              Username / පරිශීලක නාමය / பயனர் பெயர்
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-emerald-200 rounded-2xl px-4 py-1">
              <UserCircle2 size={20} color="#10b981" />
              <TextInput 
                placeholder="Enter Username..." 
                value={username} 
                onChangeText={setUsername} 
                className="flex-1 h-12 ml-3 text-emerald-900" 
                autoCapitalize="none" 
              />
            </View>
          </View>

          {/* Mobile Field */}
          <View className="mb-8">
            <Text className="text-emerald-800 font-bold mb-2 ml-1 text-xs">
              Mobile Number / ජංගම අංකය / கைபேசி எண்
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-emerald-200 rounded-2xl px-4 py-1">
              <Smartphone size={20} color="#10b981" />
              <TextInput 
                placeholder="07X XXXXXXX" 
                value={mobileNumber} 
                onChangeText={setMobileNumber} 
                keyboardType="phone-pad" 
                className="flex-1 h-12 ml-3 text-emerald-900" 
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            onPress={handleLogin} 
            disabled={loading} 
            className="bg-emerald-600 h-14 rounded-2xl flex-row items-center justify-center shadow-md shadow-emerald-400"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <View className="items-center">
                  <Text className="text-white font-bold text-sm">Login / ඇතුළු වන්න / உள்நுழைக</Text>
                </View>
                <LogIn size={20} color="white" className="ml-3" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Subtext */}
        <Text className="text-emerald-600/50 text-center mt-6 text-[10px] font-medium mb-10">
          Meal Management System V1.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}